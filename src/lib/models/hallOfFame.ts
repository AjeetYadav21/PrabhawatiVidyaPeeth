import { Schema, model, models, type Model } from "mongoose";
import type { HallOfFameContent } from "@/types/content";
import { localizedStringSchema, singletonSlugField } from "./shared";

export interface HallOfFameDocument extends HallOfFameContent {
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const topperSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    class: { type: String, required: true, trim: true },
    year: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    score: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const achievementSchema = new Schema(
  {
    title: localizedStringSchema,
    description: localizedStringSchema,
    icon: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const hallOfFameSchema = new Schema<HallOfFameDocument>(
  {
    ...singletonSlugField,
    toppers: { type: [topperSchema], default: [] },
    achievements: { type: [achievementSchema], default: [] }
  },
  { timestamps: true }
);

export const HallOfFameModel =
  (models.HallOfFame as Model<HallOfFameDocument>) ||
  model<HallOfFameDocument>("HallOfFame", hallOfFameSchema);
