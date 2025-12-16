import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: (process.env.JWT_SECRET ||
    "your-secret-key-change-in-production") as string,
  jwtExpire: (process.env.JWT_EXPIRE || "7d") as string,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:8080",
  // VietQR / Payment config
  vietQrAccount: process.env.VIET_QR_ACCOUNT || "1234567890",
  vietQrName: process.env.VIET_QR_NAME || "HOTEL BOOKING",
  bankCode: process.env.BANK_CODE || "970407", // Vietcombank
  // Gmail API config (for email payment verification)
  gmailClientId: process.env.GMAIL_CLIENT_ID || "",
  gmailClientSecret: process.env.GMAIL_CLIENT_SECRET || "",
  gmailRefreshToken: process.env.GMAIL_REFRESH_TOKEN || "",
  gmailEmail: process.env.GMAIL_EMAIL || "hotelhub2202@gmail.com",
};

export default config;
