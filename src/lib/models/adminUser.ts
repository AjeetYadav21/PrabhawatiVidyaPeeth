import { Schema, model, models, type Model } from "mongoose";
import type { AdminUser } from "@/types/auth";

export interface AdminUserDocument extends AdminUser {
  updatedAt: Date;
}

const adminUserSchema = new Schema<AdminUserDocument>(
  {
    email: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

export const AdminUserModel =
  (models.AdminUser as Model<AdminUserDocument>) ||
  model<AdminUserDocument>("AdminUser", adminUserSchema);
