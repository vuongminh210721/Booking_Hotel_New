import { Router } from "express";
import {
  handlePaymentWebhook,
  generateQRCode,
  verifyPaymentStatus,
  createQRCode,
} from "../controllers/webhookController";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// No-cache middleware for webhook routes
const noCacheMiddleware = (req: any, res: any, next: any) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
  next();
};

// Public webhook endpoint (from bank/MoMo)
// In production, verify signature and timestamp
router.post("/payment", noCacheMiddleware, handlePaymentWebhook);

// Simple QR code creation (POST) - no auth required for flexibility
router.post("/create-qrcode", noCacheMiddleware, createQRCode);

// Generate QR code image for a bill (auth required)
router.get("/qr/:billId", noCacheMiddleware, authMiddleware, generateQRCode);

// Verify payment status (admin only)
router.get(
  "/verify/:billId",
  noCacheMiddleware,
  authMiddleware,
  adminMiddleware,
  verifyPaymentStatus
);

export default router;
