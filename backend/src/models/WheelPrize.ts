import mongoose, { Document, Schema } from "mongoose";

// models/WheelPrize.ts
export interface IWheelPrize extends Document {
    prizeId: string;
    label: string;                // "500 điểm", "Voucher 500k"
    value: number;                // điểm hoặc giá trị tiền (nếu voucher)
    isVoucher: boolean;
    color: string;
    weight?: number;              // để điều chỉnh xác suất trúng (nếu cần)
    isActive: boolean;
}

const WheelPrizeSchema: Schema = new Schema({
    prizeId: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    value: { type: Number, required: true },
    isVoucher: { type: Boolean, default: false },
    color: { type: String, required: true },
    weight: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
});

export default mongoose.model<IWheelPrize>("WheelPrize", WheelPrizeSchema);