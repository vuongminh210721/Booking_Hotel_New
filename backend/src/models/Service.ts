import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  title: string;
  desc: string; // Short description
  longDesc: string; // Long description
  img: string; // Main image
  galleryImages: string[];
  price: string; // e.g., "Từ 50.000 VNĐ / kg"
  contactPerson?: string;
  process?: string[]; // Service process steps
  category:
    | "hotel_service"
    | "spa_wellness"
    | "food_beverage"
    | "transportation"
    | "activities";
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    desc: { type: String, required: true }, // Short description
    longDesc: { type: String, required: true }, // Detailed description
    img: { type: String, required: true }, // Main image URL
    galleryImages: [{ type: String }], // Gallery images
    price: { type: String, required: true }, // Price as string for flexibility
    contactPerson: { type: String },
    process: [{ type: String }], // Array of process steps
    category: {
      type: String,
      enum: [
        "hotel_service",
        "spa_wellness",
        "food_beverage",
        "transportation",
        "activities",
      ],
      required: true,
    },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for efficient querying
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ isAvailable: 1 });

export default mongoose.model<IService>("Service", ServiceSchema);
