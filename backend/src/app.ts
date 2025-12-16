import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { config } from "./utils/env";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import billRoutes from "./routes/billRoutes";
import selectRoomRoutes from "./routes/selectRoomRoutes";
import menuItemRoutes from "./routes/menuItemRoutes";
import roomRoutes from "./routes/roomRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import promotionRoutes from "./routes/promotionRoutes";

const app: Application = express();

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const uploadsPath = path.join(__dirname, "..", "uploads");
console.log("📁 Serving static files from:", uploadsPath);
app.use("/uploads", express.static(uploadsPath));

app.get("/health", (_req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    db: {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
    },
  });
});

app.get("/api/ping", (_req, res) => {
  res.json({ message: "pong" });
});

app.use("/api/auth", authRoutes);
app.use("/api/select-room", selectRoomRoutes); // Chọn phòng → Tạo Bill
app.use("/api/bookings", bookingRoutes); // Quản lý Booking (sau thanh toán)
app.use("/api/bills", billRoutes); // Quản lý Bill, xác nhận thanh toán
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/rooms", roomRoutes); // Lấy danh sách phòng
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/promotions", promotionRoutes);

app.use(errorMiddleware);

export default app;
