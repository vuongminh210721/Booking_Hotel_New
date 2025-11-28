import { Router } from "express";
import {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getUserReviews,
  getRoomReviews,
} from "../controllers/reviewController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

// Public routes
router.get("/", getAllReviews);
router.get("/:id", getReviewById);
router.get("/room/:roomId", getRoomReviews);
router.post("/:id/helpful", markHelpful);

// Protected routes (requires authentication)
router.post("/", authenticateToken, createReview);
router.put("/:id", authenticateToken, updateReview);
router.delete("/:id", authenticateToken, deleteReview);
router.get("/user/:userId", authenticateToken, getUserReviews);
router.get("/my-reviews", authenticateToken, getUserReviews);

export default router;
