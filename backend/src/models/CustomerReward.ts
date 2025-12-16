// models/CustomerReward.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICustomerReward extends Document {
  customerId: Types.ObjectId;
  points: number;
  lastSpinDate?: Date; // cho vòng quay may mắn
  quizCompleted: boolean; // cho quiz
  lastLuckyDrawDate?: Date; // <<< THÊM DÒNG NÀY <<<
  todayLuckyDrawPoints?: number; // (tùy chọn) lưu số điểm nhận được hôm nay để hiển thị lại
  spinCountToday?: number; // track lượt quay trong ngày (0-2)
}

const CustomerRewardSchema: Schema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
    unique: true,
  },
  points: { type: Number, default: 0 },
  lastSpinDate: { type: Date },
  quizCompleted: { type: Boolean, default: false },
  lastLuckyDrawDate: { type: Date }, // <<< THÊM FIELD NÀY
  todayLuckyDrawPoints: { type: Number, default: null }, // <<< TÙY CHỌN, ĐỂ HIỂN THỊ LẠI KẾT QUẢ
  spinCountToday: { type: Number, default: 0 }, // track lượt quay trong ngày
});

export default mongoose.model<ICustomerReward>(
  "CustomerReward",
  CustomerRewardSchema
);
