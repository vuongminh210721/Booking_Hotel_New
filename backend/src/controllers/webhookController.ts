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
 * Generate QR code (actual image) for payment
 * Uses VietQR if configured, otherwise fetches from online QR service
 * Returns image/png directly
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

    const amount = Math.round(bill.finalAmount || 0);
    const accountNo = config.vietQrAccount;
    const accountName = config.vietQrName;
    const memo = `HD${bill.billNumber}`;
    const bankCode = "MB"; // MoMo hoặc MB

    let qrImageBuffer = null;

    // Try using VietQR library if configured
    if (vietqr) {
      try {
        const qrResponse = await vietqr.genQRCode({
          bank: bankCode,
          accountName: accountName,
          accountNumber: accountNo,
          amount: amount,
          memo: memo,
          template: "compact",
        });

        if (qrResponse?.data?.qrDataURL) {
          const qrData = qrResponse.data.qrDataURL;
          if (qrData.startsWith("data:")) {
            // Extract base64 part
            const base64String = qrData.split(",")[1];
            qrImageBuffer = Buffer.from(base64String, "base64");
          }
          console.log("✅ VietQR generated for", billId);
        }
      } catch (err) {
        console.warn("⚠️ VietQR generation failed:", err);
      }
    }

    // Fallback: fetch from online QR service
    if (!qrImageBuffer) {
      try {
        const qrserverUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
          `00020126360014com.vietqr011800020970407${accountNo.padEnd(
            13,
            " "
          )}0712${amount}${memo}`
        )}`;

        const response = await fetch(qrserverUrl);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          qrImageBuffer = Buffer.from(arrayBuffer);
          console.log("📱 Using fallback QR service for", billId);
        }
      } catch (err) {
        console.warn("⚠️ Fallback QR service failed:", err);
      }
    }

    if (!qrImageBuffer) {
      throw new AppError("Failed to generate QR code", 500);
    }

    // Return image as PNG
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", qrImageBuffer.length);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(qrImageBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * Simple QR code generation endpoint (POST)
 * Accepts amount and memo, returns QR image file
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

    const accountNo = config.vietQrAccount;
    const accountName = config.vietQrName;
    const bankCode = "MB";
    const description = memo || "Payment";

    let qrImageBuffer = null;

    // Try using VietQR library if configured
    if (vietqr) {
      try {
        const qrResponse = await vietqr.genQRCode({
          bank: bankCode,
          accountName: accountName,
          accountNumber: accountNo,
          amount: Math.round(amount),
          memo: description,
          template: "compact",
        });

        if (qrResponse?.data?.qrDataURL) {
          // Convert base64 to buffer if it's a data URL
          const qrData = qrResponse.data.qrDataURL;
          if (qrData.startsWith("data:")) {
            // Extract base64 part
            const base64String = qrData.split(",")[1];
            qrImageBuffer = Buffer.from(base64String, "base64");
          }
          console.log("✅ VietQR generated for memo:", memo);
        }
      } catch (err) {
        console.warn("⚠️ VietQR generation failed:", err);
      }
    }

    // Fallback: fetch from online QR service
    if (!qrImageBuffer) {
      try {
        const qrserverUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
          `00020126360014com.vietqr011800020${bankCode}${accountNo.padEnd(
            13,
            " "
          )}0712${Math.round(amount)}${description}`
        )}`;

        const response = await fetch(qrserverUrl);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          qrImageBuffer = Buffer.from(arrayBuffer);
          console.log("📱 Using fallback QR service for:", memo);
        }
      } catch (err) {
        console.warn("⚠️ Fallback QR service failed:", err);
      }
    }

    if (!qrImageBuffer) {
      throw new AppError("Failed to generate QR code", 500);
    }

    // Return image as PNG
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", qrImageBuffer.length);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(qrImageBuffer);
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
