import { Router } from "express";
import { verifyEmailPayment } from "../controllers/paymentController";

const router = Router();

// POST /api/payments/verify-email
router.post("/verify-email", verifyEmailPayment);

export default router;
