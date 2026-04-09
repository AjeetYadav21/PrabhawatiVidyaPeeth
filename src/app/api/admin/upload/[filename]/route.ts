import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const publicUploadsDir = path.join(/* turbopackIgnore: true */ process.cwd(), "public", "images", "uploads");
const privateUploadsDir = path.join(/* turbopackIgnore: true */ process.cwd(), "uploads", "registrations");

const mimeTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf"
};

function getSafeFilename(filename: string): string | null {
  const safe = path.basename(filename);
  if (safe !== filename || safe.includes("..")) {
    return null;
  }
  return safe;
}

/**
 * GET serves files from the private uploads/registrations directory.
 * This route is protected by the proxy middleware (admin auth required).
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;
  const safeFilename = getSafeFilename(filename);

  if (!safeFilename) {
    return NextResponse.json({ error: "Invalid filename." }, { status: 400 });
  }

  const filePath = path.join(privateUploadsDir, safeFilename);

  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(safeFilename).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": `inline; filename="${safeFilename}"`
      }
    });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;
  const safeFilename = getSafeFilename(filename);

  if (!safeFilename) {
    return NextResponse.json({ error: "Invalid filename." }, { status: 400 });
  }

  // Try private dir first, then public dir
  for (const dir of [privateUploadsDir, publicUploadsDir]) {
    const target = path.join(dir, safeFilename);
    try {
      await fs.unlink(target);
      return NextResponse.json({ ok: true });
    } catch {
      // Try next directory
    }
  }

  return NextResponse.json({ error: "File not found." }, { status: 404 });
}
