import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ContactSubmissionModel } from "@/lib/models";
import { sanitizeDocument } from "@/lib/section-registry";

export async function GET() {
  await connectDB();
  const submissions = await ContactSubmissionModel.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(submissions.map((submission: unknown) => sanitizeDocument(submission)));
}
