// routes/promotionRoutes.ts
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  getMyRewards,
  spinWheel,
  completeQuiz,
  addPoints,
  getMyVouchers,
  luckyDraw,
  applyVoucher,
  useVoucher,
} from "../controllers/promotionController";
import { redeemPromotion } from "../controllers/promotionController";

const router = Router();

// Public routes (không cần login cũng xem được khuyến mãi)

// Protected routes (cần login)
router.get("/rewards/me", authMiddleware, getMyRewards);
router.post("/rewards/spin", authMiddleware, spinWheel);
router.post("/rewards/quiz/complete", authMiddleware, completeQuiz);
router.post("/rewards/add", authMiddleware, addPoints); // cho bốc thăm
router.post("/rewards/redeem", authMiddleware, redeemPromotion);
router.get("/vouchers/me", authMiddleware, getMyVouchers);
router.post("/rewards/luckydraw", authMiddleware, luckyDraw);
router.post("/vouchers/apply", authMiddleware, applyVoucher);
router.post("/vouchers/use", authMiddleware, useVoucher);
export default router;
