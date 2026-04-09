import { Schema, model, models, type Model } from "mongoose";
import type { Announcement } from "@/types/content";
import { localizedStringSchema } from "./shared";

export interface AnnouncementDocument extends Announcement {
  createdAt: Date;
  updatedAt: Date;
}

const announcementsSchema = new Schema<AnnouncementDocument>(
  {
    title: localizedStringSchema,
    content: localizedStringSchema,
    date: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const AnnouncementsModel =
  (models.Announcement as Model<AnnouncementDocument>) ||
  model<AnnouncementDocument>("Announcement", announcementsSchema);
