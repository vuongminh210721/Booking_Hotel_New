import { Router } from "express";
import {
  getAllBookings,
  getBookingById,
  getUserBookings,
  updateBookingStatus,
  cancelBooking,
} from "../controllers/bookingController";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware";

const router = Router();

/**
 * BOOKING ROUTES
 *
 * Quy trình mới:
 * - KHÔNG có route tạo booking trực tiếp
 * - Booking chỉ được tạo thông qua thanh toán Bill thành công
 * - Sử dụng POST /api/bills/create-direct để tạo Bill (chọn phòng)
 * - Sử dụng POST /api/bills/:id/confirm-by-user để thanh toán và tạo Booking
 */

// User routes
router.get("/user/my-bookings", authMiddleware, getUserBookings);
router.patch("/:id/cancel", authMiddleware, cancelBooking);

// Public routes
router.get("/:id", getBookingById);

// Admin routes
router.get("/", authMiddleware, adminMiddleware, getAllBookings);
router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateBookingStatus
);

export default router;
