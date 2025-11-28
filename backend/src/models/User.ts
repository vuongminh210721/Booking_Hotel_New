import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  avatarUrl?: string;
  address?: string;
  gender?: "Nam" | "Nữ" | "Khác";
  dateOfBirth?: Date;
  hometown?: string;
  customerType: "thường" | "vip";
  bookedRooms: string[];
  role: "user" | "admin";
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    address: { type: String, default: "" },
    gender: {
      type: String,
      enum: ["Nam", "Nữ", "Khác"],
      default: undefined,
    },
    dateOfBirth: { type: Date, default: undefined },
    hometown: { type: String, default: "" },
    customerType: {
      type: String,
      enum: ["thường", "vip"],
      default: "thường",
    },
    bookedRooms: { type: [String], default: [] },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
