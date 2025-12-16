import { Router } from "express";
import {
  createBill,
  convertBillToBooking,
  getAllBills,
  getBillById,
  getUserBills,
  getBillByBooking,
  updateBillStatus,
  deleteBill,
  getBillStatus,
  userConfirmPayment,
  cancelBillByUser,
  addExtraToBill,
  removeExtraFromBill,
  updateExtraInBill,
} from "../controllers/billController";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware";

const router = Router();

/**
 * BILL ROUTES
 *
 * Quản lý hóa đơn (Bill) sau khi user đã chọn phòng.
 *
 * Quy trình:
 * 1. User chọn phòng → POST /api/select-room → Tạo Bill
 * 2. POST /api/bills/:id/confirm-by-user → Xác nhận thanh toán → Tạo Booking
 *
 * Lưu ý: Để tạo Bill khi chọn phòng, sử dụng route /api/select-room
 */

// Disable caching for bill endpoints
const noCacheMiddleware = (req: any, res: any, next: any) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
  next();
};

// Public routes
router.get("/booking/:bookingId", noCacheMiddleware, getBillByBooking);

// Auth required routes - specific routes FIRST before :id catch-all
router.get("/my-bills", noCacheMiddleware, authMiddleware, getUserBills);
router.get("/:id/status", noCacheMiddleware, authMiddleware, getBillStatus);

// Chuyển Bill thành Booking sau khi thanh toán
router.post(
  "/:id/convert-to-booking",
  noCacheMiddleware,
  authMiddleware,
  convertBillToBooking
);

router.post(
  "/:id/confirm-by-user",
  noCacheMiddleware,
  authMiddleware,
  userConfirmPayment
);
router.delete(
  "/:id/cancel",
  noCacheMiddleware,
  authMiddleware,
  cancelBillByUser
);
// Extras endpoints for adding/removing services/food to a bill (user must own bill)
router.post("/:id/extras", authMiddleware, addExtraToBill);
router.patch("/:id/extras/:extraId", authMiddleware, updateExtraInBill);
router.delete("/:id/extras/:extraId", authMiddleware, removeExtraFromBill);
router.post("/", createBill);

// Admin routes - generic :id route LAST
router.get(
  "/",
  noCacheMiddleware,
  authMiddleware,
  adminMiddleware,
  getAllBills
);
router.get("/:id", noCacheMiddleware, authMiddleware, getBillById);
router.put("/:id", authMiddleware, adminMiddleware, updateBillStatus);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBill);

export default router;
