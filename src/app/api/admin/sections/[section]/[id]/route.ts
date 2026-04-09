import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSectionConfig, sanitizeDocument } from "@/lib/section-registry";

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

export async function PUT(
  request: Request,
  context: { params: Promise<{ section: string; id: string }> }
) {
  const { section, id } = await context.params;
  const config = getSectionConfig(section);

  if (!config) {
    return NextResponse.json({ error: "Invalid section." }, { status: 404 });
  }

  if (config.type !== "collection") {
    return NextResponse.json({ error: "Item-specific updates are only available for collection sections." }, { status: 400 });
  }

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid item id." }, { status: 400 });
  }

  const body = await getRequestBody(request);

  if (!body || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    await connectDB();
    const updated = await config.model.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    }).lean();

    if (!updated) {
      return NextResponse.json({ error: "Item not found." }, { status: 404 });
    }

    return NextResponse.json(sanitizeDocument(updated));
  } catch (error) {
    return NextResponse.json({ error: getValidationError(error) }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ section: string; id: string }> }
) {
  const { section, id } = await context.params;
  const config = getSectionConfig(section);

  if (!config) {
    return NextResponse.json({ error: "Invalid section." }, { status: 404 });
  }

  if (config.type !== "collection") {
    return NextResponse.json({ error: "Item-specific deletes are only available for collection sections." }, { status: 400 });
  }

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid item id." }, { status: 400 });
  }

  await connectDB();
  const deleted = await config.model.findByIdAndDelete(id).lean();

  if (!deleted) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
