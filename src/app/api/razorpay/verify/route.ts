import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { RegistrationModel } from "@/lib/models";
import { verifyPaymentSignature } from "@/lib/razorpay";
import {
  sendRegistrationConfirmation,
  sendAdminNotification,
} from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification fields." },
        { status: 400 }
      );
    }

    await connectDB();

    const registration = await RegistrationModel.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found." },
        { status: 404 }
      );
    }

    // Idempotent: already paid
    if (registration.paymentStatus === "paid") {
      return NextResponse.json({
        ok: true,
        registrationNumber: registration.registrationNumber,
      });
    }

    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed." },
        { status: 400 }
      );
    }

    registration.paymentStatus = "paid";
    registration.razorpayPaymentId = razorpay_payment_id;
    registration.razorpaySignature = razorpay_signature;
    await registration.save();

    // Fire-and-forget emails
    sendRegistrationConfirmation(registration.email, {
      studentName: registration.studentName,
      class: registration.class,
      registrationNumber: registration.registrationNumber,
      amountPaid: registration.amountPaid,
      paymentId: razorpay_payment_id,
    }).catch(() => {});

    sendAdminNotification({
      studentName: registration.studentName,
      class: registration.class,
      phone: registration.phone,
      amountPaid: registration.amountPaid,
      registrationNumber: registration.registrationNumber,
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      registrationNumber: registration.registrationNumber,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
