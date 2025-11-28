import mongoose, { Schema, Document } from "mongoose";

export interface IMenuItem extends Document {
  name: string;
  description: string;
  category:
    | "Món Châu Á"
    | "Món Châu Âu"
    | "Món Nhật Bản"
    | "Thức Uống Pha Chế"
    | "Tráng Miệng"
    | "Ăn Sáng";
  images: string[];
  price: number;
  isAvailable: boolean;
  preparationTime?: number; // in minutes
  ingredients?: string[];
  allergens?: string[];
  isVegetarian: boolean;
  isSpicy: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Món Châu Á",
        "Món Châu Âu",
        "Món Nhật Bản",
        "Thức Uống Pha Chế",
        "Tráng Miệng",
        "Ăn Sáng",
      ],
      required: true,
    },
    images: [{ type: String, required: true }],
    price: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number }, // minutes
    ingredients: [{ type: String }],
    allergens: [{ type: String }],
    isVegetarian: { type: Boolean, default: false },
    isSpicy: { type: Boolean, default: false },
    rating: { type: Number, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for efficient querying
MenuItemSchema.index({ category: 1 });
MenuItemSchema.index({ isAvailable: 1 });
MenuItemSchema.index({ rating: -1 });

export default mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
