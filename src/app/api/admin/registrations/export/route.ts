import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { RegistrationModel } from "@/lib/models";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const classFilter = url.searchParams.get("class");
  const statusFilter = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  await connectDB();

  const filter: Record<string, unknown> = {};
  if (classFilter) filter.class = classFilter;
  if (statusFilter) filter.paymentStatus = statusFilter;
  if (search) {
    filter.$or = [
      { studentName: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { registrationNumber: { $regex: search, $options: "i" } }
    ];
  }

  const registrations = await RegistrationModel.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  // CSV headers
  const headers = [
    "Registration Number",
    "Student Name",
    "Father Name",
    "Mother Name",
    "Phone",
    "Email",
    "Date of Birth",
    "Gender",
    "Class",
    "Stream",
    "Previous School",
    "Previous Marks",
    "Address",
    "Aadhar Number",
    "Category",
    "Academic Session",
    "Payment Status",
    "Amount (INR)",
    "Razorpay Payment ID",
    "Registered At"
  ];

  // Escape CSV field (handle commas, quotes, newlines)
  function escapeCSV(value: unknown): string {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const rows = registrations.map(reg => [
    reg.registrationNumber || "",
    reg.studentName,
    reg.fatherName,
    reg.motherName,
    reg.phone,
    reg.email,
    reg.dob,
    reg.gender,
    reg.class,
    reg.stream || "",
    reg.previousSchool,
    reg.previousMarks || "",
    reg.address,
    reg.aadharNumber,
    reg.category,
    reg.academicSession,
    reg.paymentStatus,
    ((reg.amountPaid || 0) / 100).toString(),
    reg.razorpayPaymentId || "",
    reg.createdAt ? new Date(reg.createdAt).toLocaleString("en-IN") : ""
  ].map(escapeCSV).join(","));

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registrations-${new Date().toISOString().split("T")[0]}.csv"`
    }
  });
}
