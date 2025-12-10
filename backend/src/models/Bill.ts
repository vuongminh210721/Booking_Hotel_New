import mongoose, { Schema, Document } from "mongoose";

export interface IBill extends Document {
  booking: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  billNumber: string;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  roomInfo: {
    roomId?: mongoose.Types.ObjectId;
    roomName: string;
    roomType: string;
    nightlyPrice: number;
  };
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  roomPrice: number;
  totalPrice: number;
  discount?: number;
  tax?: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: "paid" | "unpaid" | "partial";
  paymentAmountReceived?: number;
  paymentReference?: string;
  paymentConfirmedAt?: Date;
  paymentConfirmedBy?: mongoose.Types.ObjectId;
  specialRequests?: string;
  status: "active" | "cancelled" | "refunded";
  issuedDate: Date;
  bookingDetails?: {
    roomName: string;
    roomType: string;
    nightlyPrice: number;
    nights: number;
    guests: number;
    checkIn: Date;
    checkOut: Date;
    specialRequests?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const BillSchema: Schema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    billNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    roomInfo: {
      roomId: { type: Schema.Types.ObjectId, ref: "Room" },
      roomName: { type: String, required: true },
      roomType: { type: String, required: true },
      nightlyPrice: { type: Number, required: true },
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true },
    guests: { type: Number, required: true },
    roomPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "partial"],
      default: "unpaid",
    },
    paymentAmountReceived: { type: Number, default: 0 },
    paymentReference: { type: String },
    paymentConfirmedAt: { type: Date },
    paymentConfirmedBy: { type: Schema.Types.ObjectId, ref: "User" },
    specialRequests: String,
    status: {
      type: String,
      enum: ["active", "cancelled", "refunded"],
      default: "active",
    },
    bookingDetails: {
      roomName: { type: String },
      roomType: { type: String },
      nightlyPrice: { type: Number },
      nights: { type: Number },
      guests: { type: Number },
      checkIn: { type: Date },
      checkOut: { type: Date },
      specialRequests: { type: String },
    },
    issuedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Generate bill number automatically
BillSchema.pre("save", async function (next) {
  if (!this.billNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const count = await mongoose.model("Bill").countDocuments();
    this.billNumber = `BILL-${year}${month}-${String(count + 1).padStart(
      5,
      "0"
    )}`;
  }
  next();
});

export default mongoose.model<IBill>("Bill", BillSchema);
