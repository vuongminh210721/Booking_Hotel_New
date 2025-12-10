import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  jwtExpire: process.env.JWT_EXPIRE || "7d",
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:8080",
  // VietQR / Payment config
  vietQrAccount: process.env.VIET_QR_ACCOUNT || "1234567890",
  vietQrName: process.env.VIET_QR_NAME || "HOTEL BOOKING",
  bankCode: process.env.BANK_CODE || "970407", // Vietcombank
};

export default config;
