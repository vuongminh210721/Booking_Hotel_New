import { Router } from "express";
import {
  selectRoom,
  getRoomDetails,
  checkRoomAvailability,
} from "../controllers/selectRoomController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

/**
 * SELECT ROOM ROUTES
 *
 * Quy trình chọn phòng:
 * 1. GET /api/select-room/details - Lấy thông tin phòng chi tiết
 * 2. GET /api/select-room/availability - Kiểm tra phòng còn trống
 * 3. POST /api/select-room - Chọn phòng → Tạo Bill (chưa có Booking)
 *
 * Sau khi chọn phòng:
 * - Bill được tạo với paymentStatus: "unpaid"
 * - User thanh toán qua QR code
 * - Gọi POST /api/bills/:id/confirm-by-user để xác nhận thanh toán
 * - Booking được tạo tự động sau khi thanh toán thành công
 */

// Disable caching
const noCacheMiddleware = (req: any, res: any, next: any) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
  next();
};

// Lấy thông tin phòng chi tiết (có thể public hoặc auth)
router.get("/details", noCacheMiddleware, getRoomDetails);

// Kiểm tra phòng còn trống
router.get("/availability", noCacheMiddleware, checkRoomAvailability);

// Chọn phòng và tạo Bill (yêu cầu đăng nhập)
router.post("/", noCacheMiddleware, authMiddleware, selectRoom);

export default router;
