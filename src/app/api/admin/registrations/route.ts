import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { RegistrationModel } from "@/lib/models";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const classFilter = url.searchParams.get("class");
  const statusFilter = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  await connectDB();

  const filter: Record<string, unknown> = {};
  if (classFilter) filter.class = classFilter;
  if (statusFilter) filter.paymentStatus = statusFilter;
  if (search) {
    filter.$or = [
      { studentName: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { registrationNumber: { $regex: search, $options: "i" } }
    ];
  }

  const [registrations, total] = await Promise.all([
    RegistrationModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    RegistrationModel.countDocuments(filter)
  ]);

  return NextResponse.json({
    registrations,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  });
}
