import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendRegistrationConfirmation(
  to: string,
  data: {
    studentName: string;
    class: string;
    registrationNumber: string;
    amountPaid: number;
    paymentId: string;
  }
): Promise<boolean> {
  try {
    const amountRupees = (data.amountPaid / 100).toLocaleString("en-IN");
    const transport = getTransporter();

    await transport.sendMail({
      from:
        process.env.SMTP_FROM ||
        "Prabhawati Vidyapeeth <noreply@prabhawatividyapeeth.in>",
      to,
      subject: `Registration Confirmed - ${data.registrationNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e40af;">Registration Confirmed</h2>
          <p>Dear ${data.studentName},</p>
          <p>Your registration for Class ${data.class} at Prabhawati Vidyapeeth has been confirmed.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; font-weight: bold;">Registration Number</td>
              <td style="padding: 8px;">${data.registrationNumber}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; font-weight: bold;">Class</td>
              <td style="padding: 8px;">${data.class}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; font-weight: bold;">Amount Paid</td>
              <td style="padding: 8px;">₹${amountRupees}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; font-weight: bold;">Payment ID</td>
              <td style="padding: 8px;">${data.paymentId}</td>
            </tr>
          </table>
          <p>Please keep this email for your records.</p>
          <p style="color: #6b7280; font-size: 14px;">Prabhawati Vidyapeeth, Sahatwar, Ballia, UP</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("[email] Failed to send registration confirmation:", error);
    return false;
  }
}

export async function sendAdminNotification(data: {
  studentName: string;
  class: string;
  phone: string;
  amountPaid: number;
  registrationNumber: string;
}): Promise<boolean> {
  try {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (!adminEmail) {
      console.error("[email] ADMIN_NOTIFICATION_EMAIL not configured, skipping admin notification");
      return false;
    }

    const amountRupees = (data.amountPaid / 100).toLocaleString("en-IN");
    const transport = getTransporter();

    await transport.sendMail({
      from:
        process.env.SMTP_FROM ||
        "Prabhawati Vidyapeeth <noreply@prabhawatividyapeeth.in>",
      to: adminEmail,
      subject: `New Registration - ${data.registrationNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e40af;">New Student Registration</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; font-weight: bold;">Student Name</td>
              <td style="padding: 8px;">${data.studentName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; font-weight: bold;">Class</td>
              <td style="padding: 8px;">${data.class}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; font-weight: bold;">Phone</td>
              <td style="padding: 8px;">${data.phone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; font-weight: bold;">Amount</td>
              <td style="padding: 8px;">₹${amountRupees}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; font-weight: bold;">Registration #</td>
              <td style="padding: 8px;">${data.registrationNumber}</td>
            </tr>
          </table>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/registrations" style="color: #1e40af;">View in Admin Panel</a></p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("[email] Failed to send admin notification:", error);
    return false;
  }
}
