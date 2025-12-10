import { Request, Response, NextFunction } from "express";
import Bill from "../models/Bill";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../middlewares/errorMiddleware";
import { config } from "../config/env";

// Initialize VietQR if credentials are available
let vietqr: any = null;
try {
  const VietQR = require("vietqr").default || require("vietqr");
  if (process.env.VIET_QR_CLIENT_ID && process.env.VIET_QR_API_KEY) {
    vietqr = new VietQR({
      clientID: process.env.VIET_QR_CLIENT_ID,
      apiKey: process.env.VIET_QR_API_KEY,
    });
    console.log("✅ VietQR initialized");
  }
} catch (err) {
  console.warn("⚠️ VietQR not configured - using fallback QR generation");
}

/**
 * Webhook handler for VietQR / MoMo / Bank transfer notifications
 * Expected payload:
 * {
 *   transactionId: string,
 *   amount: number,
 *   reference: string,  // Bill ID or billNumber
 *   bankCode?: string,
 *   fromAccount?: string,
 *   toAccount?: string,
 *   description?: string,
 *   timestamp?: number
 * }
 */
export const handlePaymentWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;
    console.log("📥 Webhook received:", payload);

    // Extract bill reference from payload
    const billReference =
      payload.reference || payload.billId || payload.orderId;
    const amount = Number(payload.amount || 0);
    const transactionId = payload.transactionId || `tx-${Date.now()}`;

    if (!billReference) {
      return res
        .status(400)
        .json({ ok: false, message: "Missing bill reference" });
    }

    if (amount <= 0) {
      return res.status(400).json({ ok: false, message: "Invalid amount" });
    }

    // Find bill by ID or billNumber
    const bill = await Bill.findOne({
      $or: [{ _id: billReference }, { billNumber: billReference }],
    });

    if (!bill) {
      console.warn(`⚠️ Bill not found: ${billReference}`);
      return res.status(404).json({ ok: false, message: "Bill not found" });
    }

    const expectedAmount = Number(bill.finalAmount || bill.totalPrice || 0);
    console.log(`📊 Expected: ${expectedAmount}, Received: ${amount}`);

    // Check for duplicate/idempotency
    if (
      bill.paymentReference === transactionId &&
      bill.paymentStatus === "paid"
    ) {
      console.log("✅ Already processed:", transactionId);
      return res.status(200).json({ ok: true, message: "Already processed" });
    }

    // Update bill with payment info
    bill.paymentAmountReceived = amount;
    bill.paymentReference = transactionId;
    bill.paymentConfirmedAt = new Date();

    if (amount >= expectedAmount) {
      bill.paymentStatus = "paid";
      console.log("✅ Payment successful:", billReference);
    } else {
      bill.paymentStatus = "partial";
      console.log("⚠️ Partial payment:", billReference);
    }

    await bill.save();

    // Emit socket event if available
    try {
      const io = (req.app as any).get("io");
      if (io && bill.user) {
        io.to(`user_${bill.user}`).emit("bill_payment_update", {
          billId: bill._id,
          paymentStatus: bill.paymentStatus,
          paymentAmount: bill.paymentAmountReceived,
          paymentReference: bill.paymentReference,
        });
        console.log("📡 Socket event emitted:", bill.user);
      }
    } catch (err) {
      console.warn("⚠️ Socket emission failed:", err);
    }

    return res.status(200).json({
      ok: true,
      message: `Payment ${bill.paymentStatus}`,
      billId: bill._id,
      paymentStatus: bill.paymentStatus,
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    next(error);
  }
};

/**
 * Generate QR code for payment
 * Returns VietQR image URL from img.vietqr.io service
 * Redirects to the actual QR image
 */
export const generateQRCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { billId } = req.params;
    const bill = await Bill.findOne({
      $or: [{ _id: billId }, { billNumber: billId }],
    });

    if (!bill) {
      throw new AppError("Bill not found", 404);
    }

    const accountNo = config.vietQrAccount || "0396256658";
    const bankCode = "momo"; // MoMo bank code for VietQR image service
    const qrImageUrl = `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact.png`;

    console.log("📱 VietQR image URL for", billId, ":", qrImageUrl);

    // Redirect to VietQR image service
    return res.redirect(qrImageUrl);
  } catch (error) {
    next(error);
  }
};

/**
 * Simple QR code generation endpoint (POST)
 * Returns VietQR image URL from img.vietqr.io service
 * Used by frontend components for quick QR generation without bill context
 */
export const createQRCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount, memo } = req.body;

    if (!amount || amount <= 0) {
      throw new AppError("Invalid amount", 400);
    }

    const accountNo = config.vietQrAccount || "0396256658";
    const bankCode = "momo"; // MoMo bank code for VietQR image service
    const qrImageUrl = `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact.png`;

    console.log("📱 VietQR image URL for memo:", memo, ":", qrImageUrl);

    // Redirect to VietQR image service
    return res.redirect(qrImageUrl);
  } catch (error) {
    next(error);
  }
};
/**
 * Admin endpoint to verify payment from external service
 * Useful for manually checking status with bank API
 */
export const verifyPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { billId } = req.params;
    const bill = await Bill.findOne({
      $or: [{ _id: billId }, { billNumber: billId }],
    });

    if (!bill) {
      throw new AppError("Bill not found", 404);
    }

    // In production, call actual bank API here
    // For now, just return current status
    return res.json(
      successResponse(
        {
          billId: bill._id,
          billNumber: bill.billNumber,
          expectedAmount: bill.finalAmount,
          paymentStatus: bill.paymentStatus,
          paymentAmount: bill.paymentAmountReceived || 0,
          paymentReference: bill.paymentReference || null,
          paymentConfirmedAt: bill.paymentConfirmedAt || null,
        },
        "Payment status verified"
      )
    );
  } catch (error) {
    next(error);
  }
};
