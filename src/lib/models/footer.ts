import { Schema, model, models, type Model } from "mongoose";
import type { FooterContent } from "@/types/content";
import { localizedStringSchema, singletonSlugField } from "./shared";

export interface FooterDocument extends FooterContent {
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const footerLinkSchema = new Schema(
  {
    text: localizedStringSchema,
    href: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const footerSchema = new Schema<FooterDocument>(
  {
    ...singletonSlugField,
    aboutText: localizedStringSchema,
    quickLinks: { type: [footerLinkSchema], default: [] },
    academicLinks: { type: [footerLinkSchema], default: [] }
  },
  { timestamps: true }
);

export const FooterModel =
  (models.Footer as Model<FooterDocument>) || model<FooterDocument>("Footer", footerSchema);
