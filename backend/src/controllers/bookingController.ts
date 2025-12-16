import { Request, Response, NextFunction } from "express";
import Booking from "../models/Booking";
import Room from "../models/Room";
import Bill from "../models/Bill";
import {
  successResponse,
  paginationResponse,
} from "../utils/responseFormatter";
import { AppError } from "../middlewares/errorMiddleware";
import { AuthRequest } from "../middlewares/authMiddleware";
import { sendBookingConfirmation } from "../utils/sendEmail";

/**
 * BOOKING CONTROLLER
 *
 * Quy trình mới:
 * 1. Khách chọn phòng → Tạo Bill (qua billController.createBillDirect)
 * 2. Khách thanh toán QR → Xác nhận thanh toán
 * 3. Thanh toán thành công → Tạo Booking (qua billController.convertBillToBooking hoặc userConfirmPayment)
 *
 * Controller này chỉ quản lý Booking đã được tạo, KHÔNG tạo Booking trực tiếp.
 * Booking chỉ được tạo SAU KHI thanh toán thành công.
 */

// Lấy tất cả booking (Admin)
export const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find()
      .populate("room")
      .populate("user")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments();

    res.json(paginationResponse(bookings, page, limit, total));
  } catch (error) {
    next(error);
  }
};

// Lấy booking theo ID
export const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("room")
      .populate("user");

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }
    res.json(successResponse(booking));
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách booking của user đang đăng nhập
export const getUserBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("room")
      .sort({ createdAt: -1 });

    res.json(successResponse(bookings));
  } catch (error) {
    next(error);
  }
};

// Cập nhật trạng thái booking (Admin)
export const updateBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }
    res.json(successResponse(booking, "Booking status updated"));
  } catch (error) {
    next(error);
  }
};

// Hủy booking
export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (booking.status === "cancelled") {
      throw new AppError("Booking is already cancelled", 400);
    }

    // Hoàn lại số lượng phòng
    if (booking.room) {
      await Room.findByIdAndUpdate(booking.room, {
        $inc: { quantity: 1 },
        soldOut: false,
      });
      console.log(`📦 Đã hoàn lại quantity phòng sau khi hủy booking`);
    }

    booking.status = "cancelled";
    await booking.save();

    // Cập nhật Bill liên quan nếu có
    try {
      await Bill.updateOne(
        { booking: booking._id },
        { status: "cancelled", paymentStatus: "refunded" }
      );
    } catch (err) {
      console.warn("Could not update related bill:", err);
    }

    res.json(successResponse(booking, "Booking cancelled successfully"));
  } catch (error) {
    next(error);
  }
};

// Tạo Booking từ Bill sau khi thanh toán thành công (Internal use - được gọi từ billController)
export const createBookingFromBill = async (bill: any): Promise<any> => {
  try {
    // Lấy thông tin từ Bill
    const bookingData = {
      user: bill.user,
      room: bill.roomInfo?.roomId,
      roomName: bill.roomInfo?.roomName,
      fullName: bill.customerInfo?.fullName,
      email: bill.customerInfo?.email,
      phone: bill.customerInfo?.phone,
      checkIn: bill.checkIn,
      checkOut: bill.checkOut,
      nights: bill.nights,
      guests: bill.guests,
      totalPrice: bill.totalPrice,
      nightlyPrice: bill.roomInfo?.nightlyPrice,
      specialRequests: bill.specialRequests || "",
      paymentStatus: "paid",
      paymentMethod: bill.paymentMethod,
      status: "confirmed",
    };

    const booking = await Booking.create(bookingData);

    // Giảm số lượng phòng sau khi đặt thành công
    if (bill.roomInfo?.roomId) {
      const room = await Room.findById(bill.roomInfo.roomId);
      if (room) {
        await Room.findByIdAndUpdate(room._id, {
          $inc: { quantity: -1 },
          soldOut: room.quantity - 1 <= 0,
        });
        console.log(
          `📦 Đã giảm quantity phòng ${room.name}: ${room.quantity} -> ${
            room.quantity - 1
          }`
        );
      }
    }

    // Gửi email xác nhận đặt phòng
    try {
      const room = bill.roomInfo?.roomId
        ? await Room.findById(bill.roomInfo.roomId)
        : null;

      const roomInfo = room
        ? {
            name: room.name,
            type: room.type,
            size: room.size,
            bedType: room.bedType,
            maxGuests: room.maxGuests,
            amenities: room.amenities,
            images: room.images,
            location: room.location,
            brand: room.brand,
          }
        : {
            name: bill.roomInfo?.roomName || "Phòng tiêu chuẩn",
            type: "Standard",
            size: "-",
            bedType: "-",
            maxGuests: bill.guests,
            amenities: [],
            images: [],
            location: "-",
            brand: "HOTELHUB",
          };

      const emailPayload = {
        bookingId: (booking as any)._id.toString(),
        fullName: bill.customerInfo?.fullName,
        phone: bill.customerInfo?.phone,
        email: bill.customerInfo?.email,
        room: roomInfo,
        checkIn: new Date(bill.checkIn).toLocaleDateString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        checkOut: new Date(bill.checkOut).toLocaleDateString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        nights: bill.nights,
        guests: bill.guests,
        roomPrice: (bill.roomInfo?.nightlyPrice || 0).toLocaleString("vi-VN"),
        totalPrice: (bill.totalPrice || 0).toLocaleString("vi-VN"),
        specialRequests: bill.specialRequests,
      };

      await sendBookingConfirmation(bill.customerInfo?.email, emailPayload);
      console.log(
        "✅ Đã gửi email xác nhận đặt phòng đến:",
        bill.customerInfo?.email
      );
    } catch (emailError) {
      console.error("❌ Lỗi gửi email xác nhận:", emailError);
    }

    return booking;
  } catch (error) {
    console.error("❌ Lỗi tạo booking từ bill:", error);
    throw error;
  }
};
