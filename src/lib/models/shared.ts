import { Schema } from "mongoose";

export function localizedStringDefinition() {
  return {
    en: { type: String, required: true },
    hi: { type: String, required: true }
  };
}

export const localizedStringSchema = new Schema(localizedStringDefinition(), {
  _id: false
});

export const singletonSlugField = {
  slug: {
    type: String,
    default: "default",
    required: true,
    unique: true,
    trim: true
  }
};
