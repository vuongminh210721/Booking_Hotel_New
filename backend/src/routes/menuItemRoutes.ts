import { Router } from "express";
import {
  getAllMenuItems,
  getMenuItemsByCategory,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategories,
  getPopularMenuItems,
} from "../controllers/menuItemController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

// Public routes
router.get("/", getAllMenuItems);
router.get("/categories", getCategories);
router.get("/popular", getPopularMenuItems);
router.get("/category/:category", getMenuItemsByCategory);
router.get("/:id", getMenuItemById);

// Admin routes (would need admin middleware)
router.post("/", authenticateToken, createMenuItem);
router.put("/:id", authenticateToken, updateMenuItem);
router.delete("/:id", authenticateToken, deleteMenuItem);

export default router;
