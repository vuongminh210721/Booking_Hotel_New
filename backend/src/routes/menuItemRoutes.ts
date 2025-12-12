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
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", getAllMenuItems);
router.get("/categories", getCategories);
router.get("/popular", getPopularMenuItems);
router.get("/category/:category", getMenuItemsByCategory);
router.get("/:id", getMenuItemById);

router.post("/", authMiddleware, adminMiddleware, createMenuItem);
router.put("/:id", authMiddleware, adminMiddleware, updateMenuItem);
router.delete("/:id", authMiddleware, adminMiddleware, deleteMenuItem);

export default router;
