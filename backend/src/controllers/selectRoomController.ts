import { Response, NextFunction } from "express";
import Bill from "../models/Bill";
import Room from "../models/Room";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../middlewares/errorMiddleware";
import { AuthRequest } from "../middlewares/authMiddleware";

/**
 * SELECT ROOM CONTROLLER
 *
 * Xử lý logic khi user chọn phòng:
 * - Tìm kiếm phòng theo ID hoặc tên
 * - Tạo Bill (hóa đơn) cho phòng đã chọn
 * - Chưa tạo Booking (chỉ tạo sau khi thanh toán thành công)
 *
 * Quy trình:
 * 1. User chọn phòng → selectRoom() → Tạo Bill
 * 2. User thanh toán QR → billController.userConfirmPayment()
 * 3. Thanh toán thành công → Tạo Booking
 */

// Chọn phòng và tạo Bill
export const selectRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("📥 selectRoom called with body:", req.body);
    console.log("📥 User:", req.user?.email);

    const {
      roomId,
      roomName: roomNameInput,
      checkIn,
      checkOut,
      guests,
      fullName,
      email,
      phone,
      specialRequests,
    } = req.body;

    // Validate required fields
    if (
      !roomId ||
      !checkIn ||
      !checkOut ||
      !guests ||
      !fullName ||
      !email ||
      !phone
    ) {
      console.error("❌ Missing required fields:", {
        hasRoomId: !!roomId,
        hasCheckIn: !!checkIn,
        hasCheckOut: !!checkOut,
        hasGuests: !!guests,
        hasFullName: !!fullName,
        hasEmail: !!email,
        hasPhone: !!phone,
      });
      throw new AppError("Missing required fields", 400);
    }

    // Get room info - support both MongoDB ObjectId and room name
    console.log(
      "🔍 Looking for room with ID:",
      roomId,
      "or name:",
      roomNameInput
    );

    let room = null;
    const mongoose = require("mongoose");

    // Check if roomId is a valid MongoDB ObjectId
    if (roomId && mongoose.Types.ObjectId.isValid(roomId)) {
      room = await Room.findById(roomId);
    }

    // If not found by ObjectId, try to find by roomName (exact match first)
    if (!room && roomNameInput) {
      console.log("🔍 Trying to find by exact room name:", roomNameInput);
      room = await Room.findOne({ name: roomNameInput });
    }

    // If still not found, try partial match on room name
    if (!room && roomNameInput) {
      console.log("🔍 Trying partial match on room name...");
      room = await Room.findOne({ name: new RegExp(roomNameInput, "i") });
    }

    // If still not found, get the first available room as fallback
    if (!room) {
      console.log("🔍 Room not found, getting first available room...");
      room = await Room.findOne({ availability: true });
    }

    if (!room) {
      console.error("❌ No rooms available in database");
      throw new AppError(
        "No rooms available. Please seed the database first.",
        404
      );
    }
    console.log("✅ Found room:", {
      id: room._id,
      name: room.name,
      price: room.price,
    });

    // Check room availability
    if (room.quantity <= 0 || room.soldOut) {
      throw new AppError("This room is sold out", 400);
    }

    // Calculate nights and prices
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (nights < 1) {
      throw new AppError("Check-out must be after check-in", 400);
    }

    const nightlyPrice = room.price;
    const roomPrice = nightlyPrice * nights;
    const totalPrice = roomPrice;
    const tax = Math.round(totalPrice * 0.08); // 8% VAT
    const finalAmount = totalPrice + tax;

    // Generate bill number
    const billCount = await Bill.countDocuments();
    const billNumber = `HD-${String(billCount + 1).padStart(6, "0")}`;

    const billData = {
      user: req.user._id,
      billNumber,
      customerInfo: {
        fullName,
        email,
        phone,
      },
      roomInfo: {
        roomId: room._id,
        roomName: room.name,
        nightlyPrice,
      },
      bookingDetails: {
        roomName: room.name,
        nightlyPrice,
        nights,
        guests,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        specialRequests: specialRequests || "",
      },
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      guests,
      roomPrice,
      totalPrice,
      discount: 0,
      tax,
      finalAmount,
      paymentMethod: "qr_code", // Mặc định thanh toán QR
      paymentStatus: "unpaid", // Chưa thanh toán
      specialRequests: specialRequests || "",
      status: "active",
      issuedDate: new Date(),
    };

    const bill = await Bill.create(billData);

    console.log("✅ Room selected, Bill created:", {
      id: bill._id,
      billNumber: bill.billNumber,
      roomInfo: bill.roomInfo,
      customerInfo: bill.customerInfo,
    });

    res
      .status(201)
      .json(
        successResponse(
          bill,
          "Room selected successfully. Please proceed with payment."
        )
      );
  } catch (error) {
    next(error);
  }
};

// Lấy thông tin phòng chi tiết (để hiển thị trước khi chọn)
export const getRoomDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId, roomName } = req.query;
    const mongoose = require("mongoose");

    let room = null;

    // Try to find by ObjectId first
    if (roomId && mongoose.Types.ObjectId.isValid(roomId)) {
      room = await Room.findById(roomId);
    }

    // If not found, try by name
    if (!room && roomName) {
      room = await Room.findOne({ name: roomName });
    }

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    res.json(successResponse(room, "Room details retrieved"));
  } catch (error) {
    next(error);
  }
};

// Kiểm tra phòng còn trống không
export const checkRoomAvailability = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId, checkIn, checkOut } = req.query;
    const mongoose = require("mongoose");

    if (!roomId || !checkIn || !checkOut) {
      throw new AppError("roomId, checkIn, and checkOut are required", 400);
    }

    let room = null;
    if (mongoose.Types.ObjectId.isValid(roomId)) {
      room = await Room.findById(roomId);
    }

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    const isAvailable = room.availability && room.quantity > 0 && !room.soldOut;

    res.json(
      successResponse(
        {
          roomId: room._id,
          roomName: room.name,
          available: isAvailable,
          quantity: room.quantity,
          soldOut: room.soldOut,
        },
        isAvailable ? "Room is available" : "Room is not available"
      )
    );
  } catch (error) {
    next(error);
  }
};
