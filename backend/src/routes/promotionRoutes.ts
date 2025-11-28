import { Router } from "express";
import {
  getAllPromotions,
  getPromotionByCode,
  createPromotion,
  updatePromotion,
  deletePromotion,
  validatePromotion,
} from "../controllers/promotionController";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Public routes
router.get("/", getAllPromotions);
router.post("/validate", validatePromotion);
router.get("/:code", getPromotionByCode);

// Admin only routes
router.post("/", authMiddleware, adminMiddleware, createPromotion);
router.put("/:id", authMiddleware, adminMiddleware, updatePromotion);
router.delete("/:id", authMiddleware, adminMiddleware, deletePromotion);

export default router;
