import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSectionConfig, sanitizeDocument } from "@/lib/section-registry";

const publicCacheHeaders = {
  "Cache-Control": "s-maxage=60, stale-while-revalidate=300"
};

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

    return NextResponse.json(sanitizeDocument(document), {
      headers: publicCacheHeaders
    });
  }

  const filter = section === "announcements" ? { isActive: true } : {};
  const documents = await config.model.find(filter).sort(config.sort ?? {}).lean();

  return NextResponse.json(documents.map((document: unknown) => sanitizeDocument(document)), {
    headers: publicCacheHeaders
  });
}
