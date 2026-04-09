import { Schema, model, models, type Model } from "mongoose";
import type { HeroContent } from "@/types/content";
import { localizedStringSchema, singletonSlugField } from "./shared";

export interface HeroDocument extends HeroContent {
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const callToActionSchema = new Schema(
  {
    text: localizedStringSchema,
    link: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const heroSchema = new Schema<HeroDocument>(
  {
    ...singletonSlugField,
    title: localizedStringSchema,
    subtitle1: localizedStringSchema,
    subtitle2: localizedStringSchema,
    ctaButtons: { type: [callToActionSchema], default: [] },
    backgroundImage: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export const HeroModel =
  (models.Hero as Model<HeroDocument>) || model<HeroDocument>("Hero", heroSchema);
