import { Schema, model, models, type Model } from "mongoose";
import type { WhyUsContent } from "@/types/content";
import { localizedStringSchema, singletonSlugField } from "./shared";

export interface WhyUsDocument extends WhyUsContent {
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const featureSchema = new Schema(
  {
    title: localizedStringSchema,
    description: localizedStringSchema,
    icon: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const whyUsSchema = new Schema<WhyUsDocument>(
  {
    ...singletonSlugField,
    features: { type: [featureSchema], default: [] }
  },
  { timestamps: true }
);

export const WhyUsModel =
  (models.WhyUs as Model<WhyUsDocument>) || model<WhyUsDocument>("WhyUs", whyUsSchema);
