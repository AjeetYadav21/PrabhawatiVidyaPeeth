import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { RegistrationModel } from "@/lib/models";
import { verifyWebhookSignature } from "@/lib/razorpay";
import {
  sendRegistrationConfirmation,
  sendAdminNotification,
} from "@/lib/email";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature." },
        { status: 400 }
      );
    }

    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody) as {
      event: string;
      payload: {
        payment: {
          entity: {
            id: string;
            order_id: string;
          };
        };
      };
    };

    if (
      event.event !== "payment.captured" &&
      event.event !== "payment.failed"
    ) {
      // Acknowledge but ignore unhandled event types
      return NextResponse.json({ ok: true });
    }

    const orderId = event.payload.payment.entity.order_id;

    if (event.event === "payment.captured") {
      const paymentId = event.payload.payment.entity.id;

      await connectDB();

      const registration = await RegistrationModel.findOne({
        razorpayOrderId: orderId,
      });

      if (!registration || registration.paymentStatus === "paid") {
        // Idempotent: already processed or not found — acknowledge
        return NextResponse.json({ ok: true });
      }

      registration.paymentStatus = "paid";
      registration.razorpayPaymentId = paymentId;
      await registration.save();

      // Fire-and-forget emails
      sendRegistrationConfirmation(registration.email, {
        studentName: registration.studentName,
        class: registration.class,
        registrationNumber: registration.registrationNumber,
        amountPaid: registration.amountPaid,
        paymentId,
      }).catch(() => {});

      sendAdminNotification({
        studentName: registration.studentName,
        class: registration.class,
        phone: registration.phone,
        amountPaid: registration.amountPaid,
        registrationNumber: registration.registrationNumber,
      }).catch(() => {});
    }

    if (event.event === "payment.failed") {
      await connectDB();

      const registration = await RegistrationModel.findOne({
        razorpayOrderId: orderId,
      });

      if (registration && registration.paymentStatus === "pending") {
        registration.paymentStatus = "failed";
        await registration.save();
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Always try to return 200 for webhooks to prevent Razorpay retries
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
