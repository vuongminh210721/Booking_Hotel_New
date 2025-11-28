import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/hotel_booking",
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  jwtExpire: process.env.JWT_EXPIRE || "7d",
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:8080",
};

export default config;
