import Razorpay from "razorpay";
import crypto from "crypto";

let razorpayInstance: Razorpay | null = null;

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing ${key} environment variable`);
  }
  return value;
}

export function getRazorpayInstance(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: getEnvOrThrow("RAZORPAY_KEY_ID"),
      key_secret: getEnvOrThrow("RAZORPAY_KEY_SECRET"),
    });
  }
  return razorpayInstance;
}

export async function createOrder(
  amountInPaise: number,
  receipt: string,
  notes?: Record<string, string>
) {
  const razorpay = getRazorpayInstance();
  return razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
    notes: notes || {},
    payment: { capture: "automatic", capture_options: { automatic_expiry_period: 12, manual_expiry_period: 7200, refund_speed: "optimum" } },
  });
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", getEnvOrThrow("RAZORPAY_KEY_SECRET"))
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", getEnvOrThrow("RAZORPAY_WEBHOOK_SECRET"))
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}
