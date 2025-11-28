import mongoose, { Schema, Document } from "mongoose";

export interface ILocation extends Document {
  name: string; // e.g., "HotelHub Kim Mã"
  label: string; // e.g., "HÀ NỘI"
  city: "Hồ Chí Minh" | "Hà Nội" | "Đà Nẵng";
  address: string;
  description: string;
  image: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  phone?: string;
  email?: string;
  amenities: string[];
  roomCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    city: {
      type: String,
      enum: ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng"],
      required: true,
    },
    address: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    phone: { type: String },
    email: { type: String },
    amenities: [{ type: String }],
    roomCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for efficient querying
LocationSchema.index({ city: 1 });
LocationSchema.index({ isActive: 1 });

export default mongoose.model<ILocation>("Location", LocationSchema);
