import { Schema, model, models, type Model } from "mongoose";
import type { AdmissionsContent } from "@/types/content";
import { localizedStringSchema, singletonSlugField } from "./shared";

export interface AdmissionsDocument extends AdmissionsContent {
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const stepSchema = new Schema(
  {
    number: { type: Number, required: true },
    title: localizedStringSchema,
    description: localizedStringSchema
  },
  { _id: false }
);

const documentSchema = new Schema(
  {
    text: localizedStringSchema
  },
  { _id: false }
);

const inquiryInfoSchema = new Schema(
  {
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    text: localizedStringSchema
  },
  { _id: false }
);

const admissionsSchema = new Schema<AdmissionsDocument>(
  {
    ...singletonSlugField,
    steps: { type: [stepSchema], default: [] },
    documents: { type: [documentSchema], default: [] },
    inquiryInfo: inquiryInfoSchema
  },
  { timestamps: true }
);

export const AdmissionsModel =
  (models.Admissions as Model<AdmissionsDocument>) ||
  model<AdmissionsDocument>("Admissions", admissionsSchema);
