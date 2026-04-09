import { Schema, model, models, type Model } from "mongoose";
import type { ContactContent } from "@/types/content";
import { localizedStringSchema, singletonSlugField } from "./shared";

export interface ContactDocument extends ContactContent {
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactInfoSchema = new Schema(
  {
    address: localizedStringSchema,
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    hours: localizedStringSchema
  },
  { _id: false }
);

const contactSchema = new Schema<ContactDocument>(
  {
    ...singletonSlugField,
    info: contactInfoSchema,
    tourImage: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export const ContactModel =
  (models.Contact as Model<ContactDocument>) ||
  model<ContactDocument>("Contact", contactSchema);
