import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const allowedTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif"
]);

const maxFileSize = 5 * 1024 * 1024;
const uploadsDirectory = path.join(process.cwd(), "public", "images", "uploads");

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required." }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
  }

  await fs.mkdir(uploadsDirectory, { recursive: true });

  const safeName = sanitizeFilename(file.name);
  const filename = `${Date.now()}-${safeName}`;
  const destination = path.join(uploadsDirectory, filename);
  const bytes = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(destination, bytes);

  return NextResponse.json({
    ok: true,
    url: `/images/uploads/${filename}`
  });
}
