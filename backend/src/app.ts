import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { config } from "./config/env";
import { errorMiddleware } from "./middlewares/errorMiddleware";

// Import routes
import roomRoutes from "./routes/roomRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import authRoutes from "./routes/authRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import policyRoutes from "./routes/policyRoutes";
import promotionRoutes from "./routes/promotionRoutes";
import demoRoutes from "./routes/demoRoutes";
// import reviewRoutes from "./routes/reviewRoutes";
// import menuItemRoutes from "./routes/menuItemRoutes";
// import locationRoutes from "./routes/locationRoutes";

const app: Application = express();

// CORS phải được cấu hình TRƯỚC helmet để static files hoạt động
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

// Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Cho phép load images từ origin khác
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve static files (uploads) với CORS headers
// Đường dẫn uploads nằm ở backend/uploads (cùng cấp với src/)
const uploadsPath = path.join(__dirname, "..", "uploads");
console.log("📁 Serving static files from:", uploadsPath);
app.use("/uploads", express.static(uploadsPath));

// Health check (server only)
app.get("/health", (_req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// API health + DB status
app.get("/api/health", (_req, res) => {
  const readyState = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  res.json({
    status: "OK",
    db: {
      connected: readyState === 1,
      readyState,
    },
  });
});

// Simple ping
app.get("/api/ping", (_req, res) => {
  res.json({ message: "pong" });
});

// API Routes
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/promotions", promotionRoutes);
// app.use("/api/reviews", reviewRoutes);
// app.use("/api/menu-items", menuItemRoutes);
// app.use("/api/locations", locationRoutes);
app.use("/api", demoRoutes);

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;
