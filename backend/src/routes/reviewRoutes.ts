import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  createReview,
  getMyReviews,
  getAllReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController";

const router = Router();

router.post("/", authMiddleware, createReview);
router.get("/my", authMiddleware, getMyReviews);
router.get("/", getAllReviews);
router.patch("/:id", authMiddleware, updateReview);
router.delete("/:id", authMiddleware, deleteReview);

export default router;
