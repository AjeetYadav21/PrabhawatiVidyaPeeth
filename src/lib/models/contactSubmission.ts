import { Schema, model, models, type Model } from "mongoose";
import type { ContactSubmission } from "@/types/contact";

export interface ContactSubmissionDocument extends ContactSubmission {
  updatedAt: Date;
}

const contactSubmissionSchema = new Schema<ContactSubmissionDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const ContactSubmissionModel =
  (models.ContactSubmission as Model<ContactSubmissionDocument>) ||
  model<ContactSubmissionDocument>("ContactSubmission", contactSubmissionSchema);
