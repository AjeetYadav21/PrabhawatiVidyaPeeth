import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ContactSubmissionModel } from "@/lib/models";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { limited, retryAfterSeconds } = rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);

  if (limited) {
    return NextResponse.json(
      { error: `Too many submissions. Try again in ${retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? sanitizeString(body.name) : "";
  const email = typeof body.email === "string" ? sanitizeString(body.email) : "";
  const phone = typeof body.phone === "string" ? sanitizeString(body.phone) : "";
  const subject = typeof body.subject === "string" ? sanitizeString(body.subject) : "General Inquiry";
  const message = typeof body.message === "string" ? sanitizeString(body.message) : "";

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }

  if (!emailPattern.test(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  await connectDB();

  const submission = await ContactSubmissionModel.create({
    name,
    email,
    phone,
    subject,
    message,
    isRead: false
  });

  return NextResponse.json(
    {
      ok: true,
      submission: {
        id: submission._id.toString()
      }
    },
    { status: 201 }
  );
}
