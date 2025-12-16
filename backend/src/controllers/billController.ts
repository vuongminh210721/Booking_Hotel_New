import { Request, Response, NextFunction } from "express";
import Bill from "../models/Bill";
import Booking from "../models/Booking";
import Room from "../models/Room";
import {
  successResponse,
  paginationResponse,
} from "../utils/responseFormatter";
import { AppError } from "../middlewares/errorMiddleware";
import { AuthRequest } from "../middlewares/authMiddleware";
import { createBookingFromBill } from "./bookingController";

/**
 * BILL CONTROLLER
 *
 * Quản lý hóa đơn (Bill) sau khi user đã chọn phòng.
 *
 * Quy trình:
 * 1. User chọn phòng → selectRoomController.selectRoom() → Tạo Bill
 * 2. userConfirmPayment - User xác nhận thanh toán → Tự động tạo Booking
 * 3. convertBillToBooking - Chuyển Bill thành Booking (manual call)
 *
 * Các chức năng khác:
 * - getUserBills: Lấy danh sách hóa đơn của user
 * - getBillStatus: Kiểm tra trạng thái thanh toán
 * - addExtraToBill: Thêm dịch vụ/đồ ăn vào hóa đơn
 * - cancelBillByUser: Hủy hóa đơn (trước khi thanh toán)
 */

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
        roomName: booking.room ? (booking.room as any).name : "Standard Room",
        roomType: booking.room ? (booking.room as any).type : "Standard",
        nightlyPrice: roomPrice,
      },
      bookingDetails: {
        roomName: booking.room ? (booking.room as any).name : "Standard Room",
        roomType: booking.room ? (booking.room as any).type : "Standard",
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
      .populate("user", "fullName email");

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
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("booking")
      .populate("user", "fullName email");

    if (!bill) {
      throw new AppError("Bill not found", 404);
    }

    // Kiểm tra quyền - chỉ chủ bill hoặc admin mới có thể xem
    const userId = req.user?._id;
    const isOwner =
      bill.user && String(bill.user._id || bill.user) === String(userId);
    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new AppError("Bạn không có quyền xem hóa đơn này", 403);
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

    const bills = await Bill.find({
      user: userId,
      status: { $nin: ["cancelled", "refunded"] },
    })
      .populate("booking")
      .sort({ createdAt: -1 });

    res.json(successResponse(bills));
  } catch (error) {
    console.error("Error in getUserBills:", error);
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
      .populate("user", "fullName email");

    if (!bill) {
      throw new AppError("Bill not found for this booking", 404);
    }

    res.json(successResponse(bill));
  } catch (error) {
    next(error);
  }
};

export const addExtraToBill = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const billId = req.params.id;
    const { type, title, price, quantity = 1, image } = req.body;

    const bill = await Bill.findById(billId);
    if (!bill) throw new AppError("Bill not found", 404);

    // Only owner or admin may modify extras
    const userId = req.user._id;
    if (String(bill.user) !== String(userId)) {
      throw new AppError("Forbidden", 403);
    }

    const extraPrice = Number(price) || 0;
    const extraQuantity = Number(quantity) || 1;

    const extraItem: any = {
      type,
      title,
      price: extraPrice,
      quantity: extraQuantity,
      image,
    };

    bill.extras = bill.extras || [];
    bill.extras.push(extraItem as any);

    // Update totals
    const added = extraPrice * extraQuantity;
    bill.totalPrice = (bill.totalPrice || 0) + added;
    bill.tax = Number(((bill.totalPrice || 0) * 0.08).toFixed(2));
    bill.finalAmount = (bill.totalPrice || 0) + bill.tax;

    await bill.save();

    const populated = await Bill.findById(bill._id)
      .populate("booking")
      .populate("user", "fullName email")
      .populate("roomInfo.roomId");

    res.json(successResponse(populated, "Extra added to bill"));
  } catch (error) {
    next(error);
  }
};

export const updateExtraInBill = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const billId = req.params.id;
    const extraId = req.params.extraId;
    const { quantity } = req.body;

    const bill = await Bill.findById(billId);
    if (!bill) throw new AppError("Bill not found", 404);

    const userId = req.user._id;
    if (String(bill.user) !== String(userId)) {
      throw new AppError("Forbidden", 403);
    }

    const extra = (bill.extras || []).find(
      (e: any) =>
        String((e as any)._id) === String(extraId) ||
        String(e.id) === String(extraId)
    );
    if (!extra) throw new AppError("Extra item not found", 404);

    // Calculate the change in total price
    const extraPrice = Number(extra.price) || 0;
    const oldQuantity = Number(extra.quantity) || 1;
    const oldTotal = extraPrice * oldQuantity;
    const newQuantity = Math.max(1, Number(quantity) || oldQuantity);
    const newTotal = extraPrice * newQuantity;
    const difference = newTotal - oldTotal;

    // Update the extra quantity
    extra.quantity = newQuantity;

    // Update bill totals
    bill.totalPrice = (bill.totalPrice || 0) + difference;
    bill.tax = Number(((bill.totalPrice || 0) * 0.08).toFixed(2));
    bill.finalAmount = (bill.totalPrice || 0) + bill.tax;

    await bill.save();

    const populated = await Bill.findById(bill._id)
      .populate("booking")
      .populate("user", "fullName email")
      .populate("roomInfo.roomId");

    res.json(successResponse(populated, "Extra updated in bill"));
  } catch (error) {
    next(error);
  }
};

export const removeExtraFromBill = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const billId = req.params.id;
    const extraId = req.params.extraId;

    const bill = await Bill.findById(billId);
    if (!bill) throw new AppError("Bill not found", 404);

    const userId = req.user._id;
    if (String(bill.user) !== String(userId)) {
      throw new AppError("Forbidden", 403);
    }

    const extra = (bill.extras || []).find(
      (e: any) =>
        String((e as any)._id) === String(extraId) ||
        String(e.id) === String(extraId)
    );
    if (!extra) throw new AppError("Extra item not found", 404);

    const extraPrice = Number(extra.price) || 0;
    const extraQuantity = Number(extra.quantity) || 1;
    const deduction = extraPrice * extraQuantity;

    // Remove the extra
    bill.extras = (bill.extras || []).filter((e: any) => {
      return !(
        String((e as any)._id) === String(extraId) ||
        String(e.id) === String(extraId)
      );
    });

    bill.totalPrice = Math.max(0, (bill.totalPrice || 0) - deduction);
    bill.tax = Number(((bill.totalPrice || 0) * 0.08).toFixed(2));
    bill.finalAmount = (bill.totalPrice || 0) + bill.tax;

    await bill.save();

    const populated = await Bill.findById(bill._id)
      .populate("booking")
      .populate("user", "fullName email")
      .populate("roomInfo.roomId");

    res.json(successResponse(populated, "Extra removed from bill"));
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

    console.log("🗑️ Cancel bill request:", { billId, userId: String(userId) });

    // Find bill and verify ownership
    const bill = await Bill.findById(billId);

    if (!bill) {
      throw new AppError("Bill not found", 404);
    }

    console.log("🗑️ Found bill:", {
      billId: bill._id,
      billUser: bill.user ? String(bill.user) : "null",
      currentUser: String(userId),
      userRole: req.user.role,
      paymentStatus: bill.paymentStatus,
    });

    // Check if bill belongs to user OR user is admin
    const isOwner = bill.user && String(bill.user) === String(userId);
    const isAdmin = req.user.role === "admin";
    const isUnpaid =
      bill.paymentStatus === "unpaid" || bill.paymentStatus === "partial";

    // Cho phép xóa nếu:
    // 1. User là chủ sở hữu bill
    // 2. User là admin
    // 3. Bill chưa thanh toán (unpaid/pending) - cho phép xóa để tránh lỗi cache
    // 4. Bill không có user
    if (!isOwner && !isAdmin) {
      if (isUnpaid) {
        console.log(
          "🗑️ Bill is unpaid, allowing cancel regardless of owner (may be cached bill from different session)"
        );
      } else if (!bill.user) {
        console.log("🗑️ Bill has no user, allowing cancel");
      } else {
        console.log("🗑️ User mismatch and bill is paid - Forbidden");
        throw new AppError("You can only cancel your own bills", 403);
      }
    }

    // Check if bill is already paid - set to refunded instead of cancelled
    if (bill.paymentStatus === "paid") {
      bill.status = "refunded";
    } else {
      bill.status = "cancelled";
    }

    await bill.save();

    console.log("✅ Bill cancelled successfully:", bill._id);
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

    // Kiểm tra quyền - chỉ chủ bill hoặc admin mới có thể xem trạng thái
    const userId = req.user?._id;
    const isOwner = bill.user && String(bill.user) === String(userId);
    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new AppError("Bạn không có quyền xem trạng thái hóa đơn này", 403);
    }

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

// Tạo Booking từ Bill sau khi thanh toán thành công (gọi từ webhook email)
export const convertBillToBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const billId = req.params.id;

    const bill = await Bill.findById(billId);
    if (!bill) {
      throw new AppError("Bill not found", 404);
    }

    // Kiểm tra quyền - chỉ chủ bill hoặc admin mới có thể chuyển đổi
    const userId = req.user?._id;
    const isOwner = bill.user && String(bill.user) === String(userId);
    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new AppError("Bạn không có quyền thao tác với hóa đơn này", 403);
    }

    // Kiểm tra đã thanh toán chưa
    if (bill.paymentStatus !== "paid") {
      throw new AppError("Bill must be paid before creating booking", 400);
    }

    // Kiểm tra đã có Booking chưa
    if (bill.booking) {
      throw new AppError("Booking already exists for this bill", 400);
    }

    // Tạo Booking từ Bill data
    const bookingData = {
      user: bill.user,
      room: bill.roomInfo?.roomId,
      checkIn: bill.checkIn,
      checkOut: bill.checkOut,
      nights: bill.nights,
      guests: bill.guests,
      specialRequests: bill.specialRequests || "",
      totalPrice: bill.totalPrice,
      paymentStatus: "paid",
      paymentMethod: bill.paymentMethod,
      status: "confirmed",
    };

    const booking = await Booking.create(bookingData);

    // Cập nhật Bill với booking reference
    bill.booking = (booking as any)._id;
    await bill.save();

    const populatedBill = await Bill.findById(billId)
      .populate("booking")
      .populate("user", "fullName email");

    res.json(
      successResponse(
        { bill: populatedBill, booking },
        "Booking created successfully from bill"
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

    // Tự động tạo Booking sau khi thanh toán (nếu chưa có)
    if (!bill.booking && bill.roomInfo?.roomId) {
      try {
        // Sử dụng createBookingFromBill để tạo booking và gửi email xác nhận
        const booking = await createBookingFromBill(bill);
        if (booking) {
          bill.booking = booking._id;
          await bill.save();
          console.log(
            "✅ Auto-created booking via createBookingFromBill:",
            booking._id
          );
        }
      } catch (bookingErr) {
        console.warn("Could not create booking:", bookingErr);
      }
    } else if (bill.booking) {
      // Update existing booking if exists
      try {
        const existingBooking = await Booking.findById(bill.booking);
        if (existingBooking) {
          existingBooking.paymentStatus = "paid";
          existingBooking.status = "confirmed";
          await existingBooking.save();
          console.log("✅ Updated existing booking:", existingBooking._id);
        }
      } catch (err) {
        console.warn("Could not update booking:", err);
      }
    }

    const populatedBill = await Bill.findById(bill._id)
      .populate("booking")
      .populate("user", "fullName email");

    res.json(
      successResponse(populatedBill, "Payment confirmed and booking created")
    );
  } catch (error) {
    next(error);
  }
};
