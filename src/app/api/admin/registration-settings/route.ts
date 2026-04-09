import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { RegistrationSettingsModel } from "@/lib/models";

const DEFAULTS = {
  class10Enabled: false,
  class12Enabled: false,
  class10Fee: 0,
  class12Fee: 0,
  academicSession: "2026-27"
};

function getValidationError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Request failed.";
}

async function getRequestBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET() {
  await connectDB();

  const document = await RegistrationSettingsModel.findOne({
    slug: "default"
  }).lean();

  if (!document) {
    return NextResponse.json(DEFAULTS);
  }

  return NextResponse.json(document);
}

export async function PUT(request: Request) {
  const body = await getRequestBody(request);

  if (!body || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const updated = await RegistrationSettingsModel.findOneAndUpdate(
      { slug: "default" },
      { ...body, slug: "default" },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    ).lean();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: getValidationError(error) },
      { status: 400 }
    );
  }
}
