// models/Voucher.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVoucher extends Document {
    customerId: Types.ObjectId;
    promotionId: string;                 // _id của ưu đãi (loyal, new, ...)

    // Lưu toàn bộ thông tin ưu đãi tại thời điểm đổi (snapshot)
    promotionDetails: {
        title: string;
        shortDesc: string;
        discount: string;
        extraDiscount?: string;
        validFrom: string;
        validTo: string;
        applicableRooms: string;
        conditions: string[];
        icon: string;
        bgGradient: string;
        requiredPoints: number;
    };

    voucherCode: string;
    pointsSpent: number;
    status: "unused" | "used" | "expired";
    issuedAt: Date;
    expiresAt: Date;                     // Tính theo validTo hoặc thời hạn riêng
    usedAt?: Date;
}

const VoucherSchema: Schema = new Schema({
    customerId: {
        type: Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    promotionId: {
        type: String,
        required: true,
    },
    promotionDetails: {
        title: { type: String, required: true },
        shortDesc: { type: String, required: true },
        discount: { type: String, required: true },
        extraDiscount: { type: String },
        validFrom: { type: String, required: true },
        validTo: { type: String, required: true },
        applicableRooms: { type: String, required: true },
        conditions: [{ type: String, required: true }],
        icon: { type: String, required: true },
        bgGradient: { type: String, required: true },
        requiredPoints: { type: Number, required: true },
    },
    voucherCode: {
        type: String,
        required: true,
        unique: true,
    },
    pointsSpent: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["unused", "used", "expired"],
        default: "unused",
    },
    issuedAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    usedAt: {
        type: Date,
    },
});

export default mongoose.model<IVoucher>("Voucher", VoucherSchema);