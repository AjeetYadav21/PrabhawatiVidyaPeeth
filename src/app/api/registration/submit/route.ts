export const runtime = "nodejs";

import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { RegistrationModel, RegistrationSettingsModel } from "@/lib/models";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const aadharPattern = /^\d{12}$/;
const phonePattern = /^\d{10}$/;

const validGenders = ["male", "female", "other"] as const;
const validClasses = ["10th", "12th"] as const;
const validCategories = ["general", "obc", "sc", "st"] as const;
const validStreams = ["science-pcm", "science-pcb", "commerce", "arts"] as const;

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? sanitizeString(value) : "";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { limited, retryAfterSeconds } = rateLimit(`registration:${ip}`, 3, 10 * 60 * 1000);

  if (limited) {
    return NextResponse.json(
      { error: `Too many registration attempts. Try again in ${retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  try {
    const formData = await request.formData();

    // Extract required fields
    const studentName = getString(formData, "studentName");
    const fatherName = getString(formData, "fatherName");
    const motherName = getString(formData, "motherName");
    const phone = getString(formData, "phone");
    const email = getString(formData, "email");
    const dob = getString(formData, "dob");
    const gender = getString(formData, "gender");
    const classValue = getString(formData, "class");
    const previousSchool = getString(formData, "previousSchool");
    const address = getString(formData, "address");
    const aadharNumber = getString(formData, "aadharNumber");
    const category = getString(formData, "category");
    const academicSession = getString(formData, "academicSession");

    // Optional fields
    const stream = getString(formData, "stream");
    const previousMarks = getString(formData, "previousMarks");

    // Files
    const photo = formData.get("photo") as File | null;
    const marksheet = formData.get("marksheet") as File | null;

    // --- Validate required fields ---
    const requiredFields: Record<string, string> = {
      studentName,
      fatherName,
      motherName,
      phone,
      email,
      dob,
      gender,
      class: classValue,
      previousSchool,
      address,
      aadharNumber,
      category,
      academicSession,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return NextResponse.json(
          { error: `${field} is required.` },
          { status: 400 }
        );
      }
    }

    if (classValue === "12th" && !stream) {
      return NextResponse.json(
        { error: "stream is required for class 12th." },
        { status: 400 }
      );
    }

    // --- Validate field formats ---
    if (!aadharPattern.test(aadharNumber)) {
      return NextResponse.json(
        { error: "Aadhar number must be exactly 12 digits." },
        { status: 400 }
      );
    }

    if (!phonePattern.test(phone)) {
      return NextResponse.json(
        { error: "Phone number must be exactly 10 digits." },
        { status: 400 }
      );
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!(validGenders as readonly string[]).includes(gender)) {
      return NextResponse.json(
        { error: "Gender must be one of: male, female, other." },
        { status: 400 }
      );
    }

    if (!(validClasses as readonly string[]).includes(classValue)) {
      return NextResponse.json(
        { error: "Class must be one of: 10th, 12th." },
        { status: 400 }
      );
    }

    if (!(validCategories as readonly string[]).includes(category)) {
      return NextResponse.json(
        { error: "Category must be one of: general, obc, sc, st." },
        { status: 400 }
      );
    }

    if (stream && !(validStreams as readonly string[]).includes(stream)) {
      return NextResponse.json(
        {
          error:
            "Stream must be one of: science-pcm, science-pcb, commerce, arts.",
        },
        { status: 400 }
      );
    }

    // --- Check registration settings ---
    await connectDB();

    const settings = await RegistrationSettingsModel.findOne({
      slug: "default",
    }).lean();

    if (!settings) {
      return NextResponse.json(
        { error: "Registration is not configured. Please try again later." },
        { status: 400 }
      );
    }

    const isClassEnabled =
      classValue === "10th" ? settings.class10Enabled : settings.class12Enabled;

    if (!isClassEnabled) {
      return NextResponse.json(
        { error: `Registration for class ${classValue} is currently closed.` },
        { status: 400 }
      );
    }

    const startDateStr =
      classValue === "10th"
        ? settings.class10StartDate
        : settings.class12StartDate;
    const endDateStr =
      classValue === "10th"
        ? settings.class10EndDate
        : settings.class12EndDate;

    if (startDateStr && endDateStr) {
      const now = new Date();
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      if (now < startDate || now > endDate) {
        return NextResponse.json(
          {
            error: `Registration for class ${classValue} is not open. Registration window: ${startDateStr} to ${endDateStr}.`,
          },
          { status: 400 }
        );
      }
    }

    // --- Handle file uploads ---
    // Store in a private directory outside public/ to prevent unauthenticated access.
    // Files are served via /api/admin/upload/[filename] which requires auth.
    const uploadsDir = path.join(
      process.cwd(),
      "uploads",
      "registrations"
    );
    await fs.mkdir(uploadsDir, { recursive: true });

    let photoUrl: string | undefined;
    let marksheetUrl: string | undefined;

    if (photo && photo.size > 0) {
      const allowedImageTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];
      if (!allowedImageTypes.includes(photo.type)) {
        return NextResponse.json(
          { error: "Photo must be a JPEG, PNG, or WebP image." },
          { status: 400 }
        );
      }
      if (photo.size > 2 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Photo must be less than 2MB." },
          { status: 400 }
        );
      }
      const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const filename = `${Date.now()}-${safeName}`;
      const buffer = Buffer.from(await photo.arrayBuffer());
      await fs.writeFile(path.join(uploadsDir, filename), buffer);
      photoUrl = `/api/admin/upload/${filename}`;
    }

    if (marksheet && marksheet.size > 0) {
      const allowedMarksheetTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];
      if (!allowedMarksheetTypes.includes(marksheet.type)) {
        return NextResponse.json(
          {
            error:
              "Marksheet must be a JPEG, PNG, WebP image, or a PDF file.",
          },
          { status: 400 }
        );
      }
      if (marksheet.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Marksheet must be less than 5MB." },
          { status: 400 }
        );
      }
      const safeName = marksheet.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const filename = `${Date.now()}-${safeName}`;
      const buffer = Buffer.from(await marksheet.arrayBuffer());
      await fs.writeFile(path.join(uploadsDir, filename), buffer);
      marksheetUrl = `/api/admin/upload/${filename}`;
    }

    // --- Create registration ---
    const registration = await RegistrationModel.create({
      studentName,
      fatherName,
      motherName,
      phone,
      email,
      dob,
      gender,
      class: classValue,
      previousSchool,
      address,
      aadharNumber,
      category,
      stream: classValue === "12th" ? stream : undefined,
      previousMarks: previousMarks || undefined,
      photoUrl: photoUrl || undefined,
      marksheetUrl: marksheetUrl || undefined,
      academicSession,
      paymentStatus: "pending",
      amountPaid: 0,
    });

    return NextResponse.json(
      {
        ok: true,
        registrationId: registration._id.toString(),
        registrationNumber: registration.registrationNumber,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          error:
            "A registration with this Aadhar number already exists for this session.",
        },
        { status: 409 }
      );
    }

    console.error("Registration submission error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
