import mongoose, { Schema, Document } from "mongoose";

export interface IPromotion extends Document {
  title: string;
  description: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minBookingAmount?: number;
  maxDiscount?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  applicableRooms?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    minBookingAmount: { type: Number, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, min: 0 },
    usedCount: { type: Number, default: 0 },
    applicableRooms: [{ type: Schema.Types.ObjectId, ref: "Room" }],
  },
  { timestamps: true },
);

export default mongoose.model<IPromotion>("Promotion", PromotionSchema);
