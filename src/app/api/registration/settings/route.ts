import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { RegistrationSettingsModel } from "@/lib/models";

export async function GET() {
  try {
    await connectDB();
    const settings = await RegistrationSettingsModel.findOne({ slug: "default" }).lean();

    if (!settings) {
      return NextResponse.json({
        class10Enabled: false,
        class12Enabled: false,
        class10Fee: 0,
        class12Fee: 0,
        class10StartDate: null,
        class10EndDate: null,
        class12StartDate: null,
        class12EndDate: null,
        academicSession: "2026-27"
      });
    }

    return NextResponse.json({
      class10Enabled: settings.class10Enabled,
      class12Enabled: settings.class12Enabled,
      class10Fee: settings.class10Fee,
      class12Fee: settings.class12Fee,
      class10StartDate: settings.class10StartDate || null,
      class10EndDate: settings.class10EndDate || null,
      class12StartDate: settings.class12StartDate || null,
      class12EndDate: settings.class12EndDate || null,
      academicSession: settings.academicSession
    });
  } catch {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}
