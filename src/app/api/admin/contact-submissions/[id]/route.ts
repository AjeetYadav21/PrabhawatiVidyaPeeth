import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ContactSubmissionModel } from "@/lib/models";
import { sanitizeDocument } from "@/lib/section-registry";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid submission id." }, { status: 400 });
  }

  const body = (await request.json()) as { isRead?: boolean };

  if (typeof body.isRead !== "boolean") {
    return NextResponse.json({ error: "isRead must be a boolean." }, { status: 400 });
  }

  await connectDB();
  const updated = await ContactSubmissionModel.findByIdAndUpdate(
    id,
    { isRead: body.isRead },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  return NextResponse.json(sanitizeDocument(updated));
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid submission id." }, { status: 400 });
  }

  await connectDB();
  const deleted = await ContactSubmissionModel.findByIdAndDelete(id).lean();

  if (!deleted) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
