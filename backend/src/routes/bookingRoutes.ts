import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  getUserBookings,
  updateBookingStatus,
  cancelBooking,
} from "../controllers/bookingController";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Public routes
// Require authentication for creating bookings so bills can be linked to the user
router.post("/", authMiddleware, createBooking);
router.get("/:id", getBookingById);

// Authenticated user routes
router.get("/user/my-bookings", authMiddleware, getUserBookings);
router.patch("/:id/cancel", authMiddleware, cancelBooking);

// Admin only routes
router.get("/", authMiddleware, adminMiddleware, getAllBookings);
router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateBookingStatus
);

export default router;

// export default router;
