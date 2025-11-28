import { Router } from "express";
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomsByLocation,
} from "../controllers/roomController";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Public routes
router.get("/", getAllRooms);
router.get("/location/:location", getRoomsByLocation);
router.get("/:id", getRoomById);

// Admin only routes
router.post("/", authMiddleware, adminMiddleware, createRoom);
router.put("/:id", authMiddleware, adminMiddleware, updateRoom);
router.delete("/:id", authMiddleware, adminMiddleware, deleteRoom);

export default router;
