import { Schema, model, models, type Model } from "mongoose";
import { singletonSlugField } from "./shared";

export interface RegistrationSettingsDocument {
  slug: string;
  class10Enabled: boolean;
  class12Enabled: boolean;
  class10Fee: number;
  class12Fee: number;
  class10StartDate?: string;
  class10EndDate?: string;
  class12StartDate?: string;
  class12EndDate?: string;
  academicSession: string;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSettingsSchema = new Schema<RegistrationSettingsDocument>(
  {
    ...singletonSlugField,
    class10Enabled: { type: Boolean, default: false },
    class12Enabled: { type: Boolean, default: false },
    class10Fee: { type: Number, default: 0 },
    class12Fee: { type: Number, default: 0 },
    class10StartDate: { type: String },
    class10EndDate: { type: String },
    class12StartDate: { type: String },
    class12EndDate: { type: String },
    academicSession: { type: String, default: "2026-27" }
  },
  { timestamps: true }
);

export const RegistrationSettingsModel =
  (models.RegistrationSettings as Model<RegistrationSettingsDocument>) ||
  model<RegistrationSettingsDocument>(
    "RegistrationSettings",
    registrationSettingsSchema
  );
