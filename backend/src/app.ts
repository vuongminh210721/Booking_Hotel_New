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
import menuItemRoutes from "./routes/menuItemRoutes";
import roomRoutes from "./routes/roomRoutes";
import reviewRoutes from "./routes/reviewRoutes";

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
app.use("/api/bookings", bookingRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/reviews", reviewRoutes);

app.use(errorMiddleware);

export default app;
