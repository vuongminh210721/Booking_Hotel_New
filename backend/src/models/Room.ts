import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  name: string;
  type: "Deluxe" | "Suite" | "Presidential" | "Standard";
  size: string; // e.g., "32m²"
  bedType: string; // e.g., "King bed" or "2 Single beds"
  maxGuests: number;
  description: string;
  amenities: string[];
  images: string[];
  price: number;
  discountPrice?: number;
  availability: boolean;
  soldOut: boolean;
  location: "Hồ Chí Minh" | "Hà Nội" | "Đà Nẵng";
  brand: "express" | "hotel" | "signature";
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["Deluxe", "Suite", "Presidential", "Standard"],
      required: true,
    },
    size: { type: String, required: true },
    bedType: { type: String, required: true },
    maxGuests: { type: Number, required: true, min: 1 },
    description: { type: String, required: true },
    amenities: [{ type: String }],
    images: [{ type: String, required: true }],
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    availability: { type: Boolean, default: true },
    soldOut: { type: Boolean, default: false },
    location: {
      type: String,
      enum: ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng"],
      required: true,
    },
    brand: {
      type: String,
      enum: ["express", "hotel", "signature"],
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IRoom>("Room", RoomSchema);
