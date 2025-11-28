import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  room?: mongoose.Types.ObjectId;
  hotelName: string;
  rating: number; // 1-5 stars
  comment: string;
  images?: string[];
  isVerified: boolean; // Verified stay
  helpful: number; // Number of helpful votes
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    hotelName: { type: String, required: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: { type: String, required: true },
    images: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for efficient querying
ReviewSchema.index({ room: 1, createdAt: -1 });
ReviewSchema.index({ user: 1 });
ReviewSchema.index({ rating: -1 });

export default mongoose.model<IReview>("Review", ReviewSchema);
