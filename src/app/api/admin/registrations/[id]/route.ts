import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { RegistrationModel } from "@/lib/models";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid ID." }, { status: 400 });
  }

  await connectDB();
  const registration = await RegistrationModel.findById(id).lean();

  if (!registration) {
    return NextResponse.json(
      { error: "Registration not found." },
      { status: 404 }
    );
  }

  return NextResponse.json(registration);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid ID." }, { status: 400 });
  }

  await connectDB();
  const registration = await RegistrationModel.findById(id);

  if (!registration) {
    return NextResponse.json(
      { error: "Registration not found." },
      { status: 404 }
    );
  }

  if (registration.paymentStatus === "paid") {
    return NextResponse.json(
      { error: "Cannot delete a paid registration." },
      { status: 400 }
    );
  }

  await RegistrationModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
