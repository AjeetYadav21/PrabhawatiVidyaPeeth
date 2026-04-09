import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { RegistrationModel } from "@/lib/models";

export async function GET() {
  await connectDB();

  const [total, paid, pending, failed] = await Promise.all([
    RegistrationModel.countDocuments(),
    RegistrationModel.countDocuments({ paymentStatus: "paid" }),
    RegistrationModel.countDocuments({ paymentStatus: "pending" }),
    RegistrationModel.countDocuments({ paymentStatus: "failed" })
  ]);

  const revenueResult = await RegistrationModel.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$amountPaid" } } }
  ]);
  const revenue = revenueResult[0]?.total || 0;

  const byClass = await RegistrationModel.aggregate([
    {
      $group: {
        _id: { class: "$class", status: "$paymentStatus" },
        count: { $sum: 1 }
      }
    }
  ]);

  const classStats: Record<string, Record<string, number>> = {
    "10th": { total: 0, paid: 0, pending: 0, failed: 0 },
    "12th": { total: 0, paid: 0, pending: 0, failed: 0 }
  };

  for (const item of byClass) {
    const cls = item._id.class as string;
    const status = item._id.status as string;
    if (classStats[cls]) {
      classStats[cls][status] = item.count;
      classStats[cls].total += item.count;
    }
  }

  return NextResponse.json({
    total,
    paid,
    pending,
    failed,
    revenue,
    byClass: classStats
  });
}
