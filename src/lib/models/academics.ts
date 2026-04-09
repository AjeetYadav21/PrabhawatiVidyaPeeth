import { Schema, model, models, type Model } from "mongoose";
import type { AcademicsContent } from "@/types/content";
import { localizedStringSchema, singletonSlugField } from "./shared";

export interface AcademicsDocument extends AcademicsContent {
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const levelSchema = new Schema(
  {
    name: localizedStringSchema,
    icon: { type: String, required: true, trim: true },
    grades: localizedStringSchema,
    description: localizedStringSchema
  },
  { _id: false }
);

const subjectSchema = new Schema(
  {
    name: localizedStringSchema,
    icon: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const languageSchema = new Schema(
  {
    name: localizedStringSchema
  },
  { _id: false }
);

const academicsSchema = new Schema<AcademicsDocument>(
  {
    ...singletonSlugField,
    levels: { type: [levelSchema], default: [] },
    subjects: { type: [subjectSchema], default: [] },
    languages: { type: [languageSchema], default: [] }
  },
  { timestamps: true }
);

export const AcademicsModel =
  (models.Academics as Model<AcademicsDocument>) ||
  model<AcademicsDocument>("Academics", academicsSchema);
