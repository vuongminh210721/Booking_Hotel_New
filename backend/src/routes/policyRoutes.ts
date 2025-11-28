import { Router } from "express";
import {
  getAllPolicies,
  getPolicyBySlug,
  createPolicy,
  updatePolicy,
  deletePolicy,
} from "../controllers/policyController";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Public routes
router.get("/", getAllPolicies);
router.get("/:slug", getPolicyBySlug);

// Admin only routes
router.post("/", authMiddleware, adminMiddleware, createPolicy);
router.put("/:id", authMiddleware, adminMiddleware, updatePolicy);
router.delete("/:id", authMiddleware, adminMiddleware, deletePolicy);

export default router;
