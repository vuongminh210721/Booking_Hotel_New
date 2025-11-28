import { Router } from "express";
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Public routes
router.get("/", getAllServices);
router.get("/:id", getServiceById);

// Admin only routes
router.post("/", authMiddleware, adminMiddleware, createService);
router.put("/:id", authMiddleware, adminMiddleware, updateService);
router.delete("/:id", authMiddleware, adminMiddleware, deleteService);

export default router;
