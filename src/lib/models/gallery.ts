import { Schema, model, models, type Model } from "mongoose";
import type { GalleryItem } from "@/types/content";
import { localizedStringSchema } from "./shared";

export interface GalleryDocument extends GalleryItem {
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<GalleryDocument>(
  {
    image: { type: String, required: true, trim: true },
    caption: localizedStringSchema,
    category: {
      type: String,
      required: true,
      enum: ["campus", "events", "sports", "activities"]
    }
  },
  { timestamps: true }
);

export const GalleryModel =
  (models.Gallery as Model<GalleryDocument>) ||
  model<GalleryDocument>("Gallery", gallerySchema);
