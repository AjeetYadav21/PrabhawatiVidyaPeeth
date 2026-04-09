import { Schema, model, models, type Model } from "mongoose";

export interface RegistrationDocument {
  studentName: string;
  fatherName: string;
  motherName: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  class: string;
  previousSchool: string;
  address: string;
  aadharNumber: string;
  category: string;
  stream?: string;
  previousMarks?: string;
  photoUrl?: string;
  marksheetUrl?: string;
  registrationNumber: string;
  academicSession: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentStatus: string;
  amountPaid: number;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<RegistrationDocument>(
  {
    studentName: { type: String, required: true, trim: true },
    fatherName: { type: String, required: true, trim: true },
    motherName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    dob: { type: String, required: true },
    gender: { type: String, required: true, enum: ["male", "female", "other"] },
    class: { type: String, required: true, enum: ["10th", "12th"] },
    previousSchool: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    aadharNumber: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["general", "obc", "sc", "st"]
    },
    stream: {
      type: String,
      enum: ["science-pcm", "science-pcb", "commerce", "arts"]
    },
    previousMarks: { type: String, trim: true },
    photoUrl: { type: String },
    marksheetUrl: { type: String },
    registrationNumber: { type: String, unique: true },
    academicSession: { type: String, required: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    amountPaid: { type: Number, default: 0 }
  },
  { timestamps: true }
);

registrationSchema.index(
  { aadharNumber: 1, academicSession: 1 },
  { unique: true }
);
registrationSchema.index({ paymentStatus: 1 });
registrationSchema.index({ class: 1 });

registrationSchema.pre("save", async function (next) {
  if (this.isNew && !this.registrationNumber) {
    const year = this.academicSession.split("-")[0];
    const classCode = this.class === "10th" ? "10" : "12";
    const count = await RegistrationModel.countDocuments({
      academicSession: this.academicSession,
      class: this.class
    });
    const sequence = String(count + 1).padStart(4, "0");
    this.registrationNumber = `PVP-${year}-${classCode}-${sequence}`;
  }
  next();
});

export const RegistrationModel =
  (models.Registration as Model<RegistrationDocument>) ||
  model<RegistrationDocument>("Registration", registrationSchema);
