import mongoose, { Schema, Document } from "mongoose";

export interface IPolicy extends Document {
  title: string;
  type: "check-in" | "refund" | "privacy" | "member" | "general";
  content: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PolicySchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["check-in", "refund", "privacy", "member", "general"],
      required: true,
    },
    content: { type: String, required: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model<IPolicy>("Policy", PolicySchema);
