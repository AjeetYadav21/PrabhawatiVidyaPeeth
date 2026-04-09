import { Schema, model, models, type Model } from "mongoose";
import type { EventItem } from "@/types/content";
import { localizedStringSchema } from "./shared";

export interface EventDocument extends EventItem {
  createdAt: Date;
  updatedAt: Date;
}

const eventsSchema = new Schema<EventDocument>(
  {
    title: localizedStringSchema,
    description: localizedStringSchema,
    date: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export const EventsModel =
  (models.Event as Model<EventDocument>) || model<EventDocument>("Event", eventsSchema);
