// models/Promotion.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPromotion extends Document {
  user?: mongoose.Types.ObjectId; // User ownership for personalized promotions
  promotionId: string; // mã định danh cố định (loyal, new, family...)
  title: string;
  shortDesc: string;
  discount: string; // "25%" hoặc "200.000₫"
  extraDiscount?: string;
  validFrom: Date;
  validTo: Date;
  applicableRooms: string[]; // ["Deluxe", "Suite", "All"]
  conditions: string[];
  icon: string; // className của lucide icon hoặc URL
  bgGradient: string; // "from-amber-500 to-orange-600"
  promotionType:
    | "loyalty"
    | "new_customer"
    | "family"
    | "business"
    | "group"
    | "season"
    | "early_bird"
    | "bundle"
    | "flash_sale";
  minStayDays?: number;
  maxUsesPerCustomer?: number;
  targetAudience: "all" | "new_customer" | "returning_customer" | "vip_only";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // Support for system/global promotions
    },
    promotionId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    shortDesc: { type: String, required: true },
    discount: { type: String, required: true },
    extraDiscount: { type: String },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    applicableRooms: { type: [String], default: ["All"] },
    conditions: { type: [String], required: true },
    icon: { type: String, required: true }, // ví dụ: "Star", "UserPlus", "Baby"
    bgGradient: { type: String, required: true },
    promotionType: {
      type: String,
      enum: [
        "loyalty",
        "new_customer",
        "family",
        "business",
        "group",
        "season",
        "early_bird",
        "bundle",
        "flash_sale",
      ],
      required: true,
    },
    minStayDays: { type: Number },
    maxUsesPerCustomer: { type: Number, default: 1 },
    targetAudience: {
      type: String,
      enum: ["all", "new_customer", "returning_customer", "vip_only"],
      default: "all",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPromotion>("Promotion", PromotionSchema);
