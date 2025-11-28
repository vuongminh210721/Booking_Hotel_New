import { Router } from "express";
import {
  getAllLocations,
  getLocationById,
  getLocationsByCity,
  createLocation,
  updateLocation,
  deleteLocation,
  getCities,
} from "../controllers/locationController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

// Public routes
router.get("/", getAllLocations);
router.get("/cities", getCities);
router.get("/city/:city", getLocationsByCity);
router.get("/:id", getLocationById);

// Admin routes (would need admin middleware)
router.post("/", authenticateToken, createLocation);
router.put("/:id", authenticateToken, updateLocation);
router.delete("/:id", authenticateToken, deleteLocation);

export default router;
