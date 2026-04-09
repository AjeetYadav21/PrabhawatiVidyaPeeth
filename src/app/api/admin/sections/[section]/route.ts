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

export async function GET(
  _request: Request,
  context: { params: Promise<{ section: string }> }
) {
  const { section } = await context.params;
  const config = getSectionConfig(section);

  if (!config) {
    return NextResponse.json({ error: "Invalid section." }, { status: 404 });
  }

  await connectDB();

  if (config.type === "singleton") {
    const document = await config.model.findOne({ slug: "default" }).lean();

    if (!document) {
      return NextResponse.json({ error: "Section not found." }, { status: 404 });
    }

    return NextResponse.json(sanitizeDocument(document));
  }

  const documents = await config.model.find({}).sort(config.sort ?? {}).lean();
  return NextResponse.json(documents.map((document: unknown) => sanitizeDocument(document)));
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ section: string }> }
) {
  const { section } = await context.params;
  const config = getSectionConfig(section);

  if (!config) {
    return NextResponse.json({ error: "Invalid section." }, { status: 404 });
  }

  if (config.type !== "singleton") {
    return NextResponse.json({ error: "Use item-specific route for collection updates." }, { status: 400 });
  }

  const body = await getRequestBody(request);

  if (!body || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    await connectDB();

    const updated = await config.model.findOneAndUpdate(
      { slug: "default" },
      { ...body, slug: "default" },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    ).lean();

    return NextResponse.json(sanitizeDocument(updated));
  } catch (error) {
    return NextResponse.json({ error: getValidationError(error) }, { status: 400 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ section: string }> }
) {
  const { section } = await context.params;
  const config = getSectionConfig(section);

  if (!config) {
    return NextResponse.json({ error: "Invalid section." }, { status: 404 });
  }

  if (config.type !== "collection") {
    return NextResponse.json({ error: "POST is only available for collection sections." }, { status: 400 });
  }

  const body = await getRequestBody(request);

  if (!body || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    await connectDB();
    const created = await config.model.create(body);
    return NextResponse.json(sanitizeDocument(created.toObject()), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getValidationError(error) }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ section: string }> }
) {
  const { section } = await context.params;
  const config = getSectionConfig(section);

  if (!config) {
    return NextResponse.json({ error: "Invalid section." }, { status: 404 });
  }

  if (config.type !== "collection") {
    return NextResponse.json({ error: "DELETE is only available for collection sections." }, { status: 400 });
  }

  const body = await getRequestBody(request);
  const id = request.url ? new URL(request.url).searchParams.get("id") ?? body?.id : body?.id;

  if (!id || !isValidObjectId(id)) {
    return NextResponse.json({ error: "A valid item id is required." }, { status: 400 });
  }

  await connectDB();
  const deleted = await config.model.findByIdAndDelete(id).lean();

  if (!deleted) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
