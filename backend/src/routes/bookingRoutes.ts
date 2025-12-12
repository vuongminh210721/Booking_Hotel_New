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

router.post("/", authMiddleware, createBooking);
router.get("/:id", getBookingById);
router.get("/user/my-bookings", authMiddleware, getUserBookings);
router.patch("/:id/cancel", authMiddleware, cancelBooking);
router.get("/", authMiddleware, adminMiddleware, getAllBookings);
router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateBookingStatus
);

export default router;
