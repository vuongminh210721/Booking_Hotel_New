import { Router } from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  uploadAvatar as uploadAvatarController,
} from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { uploadAvatar } from "../middlewares/uploadMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post(
  "/upload-avatar",
  authMiddleware,
  uploadAvatar,
  uploadAvatarController,
);

export default router;
