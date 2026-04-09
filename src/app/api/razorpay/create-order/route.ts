import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { RegistrationModel, RegistrationSettingsModel } from "@/lib/models";
import { createOrder } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    let body: { registrationId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { registrationId } = body;
    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const registration = await RegistrationModel.findById(registrationId);
    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found." },
        { status: 404 }
      );
    }

    if (registration.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "This registration has already been paid." },
        { status: 400 }
      );
    }

    const settings = await RegistrationSettingsModel.findOne({
      slug: "default"
    }).lean();

    const fee =
      registration.class === "10th"
        ? settings?.class10Fee
        : settings?.class12Fee;

    if (!fee || !settings) {
      return NextResponse.json(
        { error: "Registration fee not configured." },
        { status: 400 }
      );
    }

    const order = await createOrder(fee, `reg_${registration._id}`, {
      registrationId: registration._id.toString(),
      class: registration.class
    });

    registration.razorpayOrderId = order.id;
    registration.amountPaid = fee;
    await registration.save();

    return NextResponse.json({
      orderId: order.id,
      amount: fee,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order." },
      { status: 500 }
    );
  }
}
