import { Router } from "express";
import {
  createBill,
  getAllBills,
  getBillById,
  getUserBills,
  getBillByBooking,
  updateBillStatus,
  deleteBill,
  getBillStatus,
  userConfirmPayment,
} from "../controllers/billController";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware";

const router = Router();

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
router.post(
  "/:id/confirm-by-user",
  noCacheMiddleware,
  authMiddleware,
  userConfirmPayment
);
router.post("/", createBill);

// Admin routes - generic :id route LAST
router.get(
  "/",
  noCacheMiddleware,
  authMiddleware,
  adminMiddleware,
  getAllBills
);
router.get("/:id", noCacheMiddleware, getBillById);
router.put("/:id", authMiddleware, adminMiddleware, updateBillStatus);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBill);

export default router;
