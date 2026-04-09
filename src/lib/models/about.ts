import { Schema, model, models, type Model } from "mongoose";
import type { AboutContent } from "@/types/content";
import { localizedStringSchema, singletonSlugField } from "./shared";

export interface AboutDocument extends AboutContent {
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const paragraphSchema = new Schema(
  {
    text: localizedStringSchema
  },
  { _id: false }
);

const principalMessageSchema = new Schema(
  {
    name: localizedStringSchema,
    image: { type: String, required: true, trim: true },
    message: localizedStringSchema
  },
  { _id: false }
);

const aboutSchema = new Schema<AboutDocument>(
  {
    ...singletonSlugField,
    campusImage: { type: String, required: true, trim: true },
    paragraphs: { type: [paragraphSchema], default: [] },
    upBoardLink: { type: String, required: true, trim: true },
    principalMessage: principalMessageSchema
  },
  { timestamps: true }
);

export const AboutModel =
  (models.About as Model<AboutDocument>) || model<AboutDocument>("About", aboutSchema);
