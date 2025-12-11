import { Request, Response, NextFunction } from "express";
import Bill from "../models/Bill";
import Booking from "../models/Booking";
import {
  successResponse,
  paginationResponse,
} from "../utils/responseFormatter";
import { AppError } from "../middlewares/errorMiddleware";
import { AuthRequest } from "../middlewares/authMiddleware";

export const createBill = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate("room");
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    // Check if bill already exists
    const existingBill = await Bill.findOne({ booking: bookingId });
    if (existingBill) {
      return res.json(successResponse(existingBill, "Bill already exists"));
    }

    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const roomPrice = booking.nightlyPrice || (booking.room as any)?.price || 0;
    const totalPrice = booking.totalPrice;
    const tax = totalPrice * 0.08; // 8% VAT
    const finalAmount = totalPrice + tax;

    const billData = {
      booking: booking._id,
      user: booking.user,
      customerInfo: {
        fullName: booking.fullName,
        email: booking.email,
        phone: booking.phone,
      },
      roomInfo: {
        roomId: booking.room ? (booking.room as any)._id : undefined,
        roomName: booking.room
          ? (booking.room as any).name
          : booking.roomType || "Standard Room",
        roomType: booking.room
          ? (booking.room as any).type
          : booking.roomType || "Standard",
        nightlyPrice: roomPrice,
      },
      bookingDetails: {
        roomName: booking.room
          ? (booking.room as any).name
          : booking.roomType || "Standard Room",
        roomType: booking.room
          ? (booking.room as any).type
          : booking.roomType || "Standard",
        nightlyPrice: roomPrice,
        nights,
        guests: booking.guests,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        specialRequests: booking.specialRequests,
      },
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights,
      guests: booking.guests,
      roomPrice,
      totalPrice,
      discount: 0,
      tax,
      finalAmount,
      paymentMethod: booking.paymentStatus === "paid" ? "paid" : "deposit",
      paymentStatus: booking.paymentStatus || "unpaid",
      specialRequests: booking.specialRequests,
      status: booking.status === "cancelled" ? "cancelled" : "active",
    };

    const bill = await Bill.create(billData);
    const populatedBill = await Bill.findById(bill._id)
      .populate("booking")
      .populate("user", "fullName email")
      .populate("roomInfo.roomId");

    res
      .status(201)
      .json(successResponse(populatedBill, "Bill created successfully"));
  } catch (error) {
    next(error);
  }
};

export const getAllBills = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const bills = await Bill.find()
      .populate("booking")
      .populate("user", "fullName email")
      .populate("roomInfo.roomId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Bill.countDocuments();

    res.json(paginationResponse(bills, page, limit, total));
  } catch (error) {
    next(error);
  }
};

export const getBillById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("booking")
      .populate("user", "fullName email")
      .populate("roomInfo.roomId");

    if (!bill) {
      throw new AppError("Bill not found", 404);
    }

    res.json(successResponse(bill));
  } catch (error) {
    next(error);
  }
};

export const getUserBills = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    console.log("\n\n🔍 ============= getUserBills START =============");
    console.log("🔍 User ID from token:", userId);
    console.log("🔍 User ID type:", typeof userId);
    console.log("🔍 Full user object:", req.user);

    // Try to find ALL bills first (for debugging)
    const allBills = await Bill.find({});
    console.log(`\n📊 Total bills in database: ${allBills.length}`);

    // Now filter by user - only return active bills (exclude cancelled and refunded)
    console.log(`\n🔎 Searching for bills with user: ${userId}`);
    const bills = await Bill.find({
      user: userId,
      status: { $nin: ["cancelled", "refunded"] }, // Exclude cancelled and refunded bills
    })
      .populate("booking")
      .populate("roomInfo.roomId")
      .sort({ createdAt: -1 });

    console.log(`\n✅ Found ${bills.length} bills for user ${userId}`);
    if (bills.length > 0) {
      bills.forEach((bill: any, index: number) => {
        console.log(`\n  📋 Bill ${index + 1}:`, {
          billId: bill._id,
          user: bill.user,
          userString: String(bill.user),
          roomName: bill.bookingDetails?.roomName || bill.roomInfo?.roomName,
          totalPrice: bill.totalPrice,
          bookingId: bill.booking,
        });
      });
    } else {
      console.log("  ⚠️  No bills found for this user");
      console.log(
        "  💡 All bills in DB:",
        allBills.map((b: any) => ({
          billId: b._id,
          billUser: b.user,
          billUserString: String(b.user),
        }))
      );
    }

    console.log("\n🔍 ============= getUserBills END =============\n");
    res.json(successResponse(bills));
  } catch (error) {
    console.error("❌ Error in getUserBills:", error);
    next(error);
  }
};

export const getBillByBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bill = await Bill.findOne({ booking: req.params.bookingId })
      .populate("booking")
      .populate("user", "fullName email")
      .populate("roomInfo.roomId");

    if (!bill) {
      throw new AppError("Bill not found for this booking", 404);
    }

    res.json(successResponse(bill));
  } catch (error) {
    next(error);
  }
};

export const cancelBillByUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const billId = req.params.id;

    // Find bill and verify ownership
    const bill = await Bill.findById(billId);

    if (!bill) {
      throw new AppError("Bill not found", 404);
    }

    // Check if bill belongs to user
    if (String(bill.user) !== String(userId)) {
      throw new AppError("You can only cancel your own bills", 403);
    }

    // Check if bill is already paid - set to refunded instead of cancelled
    if (bill.paymentStatus === "paid") {
      bill.status = "refunded";
    } else {
      bill.status = "cancelled";
    }

    await bill.save();

    res.json(successResponse(bill, "Bill cancelled successfully"));
  } catch (error) {
    next(error);
  }
};

export const updateBillStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, paymentStatus } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const bill = await Bill.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("booking")
      .populate("roomInfo.roomId");

    if (!bill) {
      throw new AppError("Bill not found", 404);
    }

    res.json(successResponse(bill, "Bill updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const deleteBill = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) {
      throw new AppError("Bill not found", 404);
    }

    res.json(successResponse(null, "Bill deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export const getBillStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const bill = await Bill.findOne({ $or: [{ _id: id }, { billNumber: id }] });
    if (!bill) throw new AppError("Bill not found", 404);

    return res.json(
      successResponse(
        {
          paymentStatus: bill.paymentStatus,
          paymentAmountReceived: bill.paymentAmountReceived || 0,
          paymentReference: bill.paymentReference || null,
          finalAmount: bill.finalAmount,
        },
        "Bill payment status"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const userConfirmPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const user = req.user;
    if (!user) throw new AppError("Unauthorized", 401);

    const bill = await Bill.findOne({ $or: [{ _id: id }, { billNumber: id }] });
    if (!bill) throw new AppError("Bill not found", 404);

    // Only owner or admin can confirm
    if (
      bill.user &&
      String(bill.user) !== String(user._id) &&
      user.role !== "admin"
    ) {
      throw new AppError("Forbidden", 403);
    }

    // Mark as paid
    const expected = Number(bill.finalAmount || bill.totalPrice || 0);
    bill.paymentAmountReceived = expected;
    bill.paymentReference = `user-confirm-${Date.now()}`;
    bill.paymentConfirmedAt = new Date();
    bill.paymentStatus = "paid";
    await bill.save();

    // Update linked booking if exists
    try {
      if (bill.booking) {
        const booking = await Booking.findById(bill.booking);
        if (booking) {
          booking.paymentStatus = "paid";
          booking.status = "confirmed";
          await booking.save();
        }
      }
    } catch (err) {
      console.warn("Could not update booking:", err);
    }

    res.json(successResponse(bill, "Payment confirmed by user"));
  } catch (error) {
    next(error);
  }
};
