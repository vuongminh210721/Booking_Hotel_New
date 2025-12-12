import { Request, Response, NextFunction } from "express";
import Booking from "../models/Booking";
import Room from "../models/Room";
// import Policy from "../models/Policy";
import Bill from "../models/Bill";
import {
  successResponse,
  paginationResponse,
} from "../utils/responseFormatter";
import { AppError } from "../middlewares/errorMiddleware";
import { AuthRequest } from "../middlewares/authMiddleware";
import { sendBookingConfirmation } from "../utils/sendEmail";

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      roomId,
      roomType,
      roomName,
      roomPrice: customRoomPrice,
      fullName,
      email,
      phone,
      checkIn,
      checkOut,
      guests,
      paymentMethod,
      specialRequests,
    } = req.body;

    let room = null;
    let roomPrice = 0;

    const isValidRoomId =
      roomId && typeof roomId === "string" && roomId.trim().length > 0;

    if (isValidRoomId) {
      room = await Room.findById(roomId).catch(() => null);
      if (!room) {
        if (roomName && customRoomPrice) {
          room = null;
          roomPrice = parseFloat(customRoomPrice);
        } else {
          throw new AppError("Room not found", 404);
        }
      } else {
        if (!room.availability || room.soldOut) {
          throw new AppError("Room is not available", 400);
        }
        roomPrice = room.discountPrice || room.price;
      }
    } else if (roomName && customRoomPrice) {
      roomPrice = parseFloat(customRoomPrice);
    } else {
      throw new AppError("Room information is required", 400);
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) {
      throw new AppError("Invalid check-in/check-out dates", 400);
    }

    const totalPrice = roomPrice * nights;

    const bookingPayload: any = {
      roomName: roomName || roomType,
      fullName,
      email,
      phone,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      status: "confirmed",
      paymentStatus: paymentMethod === "deposit" ? "unpaid" : "paid",
      specialRequests: roomType
        ? `Loại phòng: ${roomType}${
            specialRequests ? ". " + specialRequests : ""
          }`
        : specialRequests,
    };
    if (room) {
      bookingPayload.room = room._id;
    } else if (roomType) {
      bookingPayload.roomType = roomType;
      bookingPayload.nightlyPrice = roomPrice;
    }

    const booking = await Booking.create(bookingPayload);

    let populatedBooking = booking;
    if (room) {
      populatedBooking = (await Booking.findById(booking._id).populate(
        "room"
      )) as any;
    }

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
          name: roomType,
          type: roomType,
          size: "-",
          bedType: "-",
          maxGuests: guests,
          amenities: [],
          images: [],
          location: "-",
          brand: "HOTELHUB",
        };

    try {
      const emailPayloadBase = {
        bookingId: (booking as any)._id.toString(),
        fullName,
        phone,
        email,
        room: roomInfo,
        checkIn: checkInDate.toLocaleDateString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        checkOut: checkOutDate.toLocaleDateString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        nights,
        guests,
        roomPrice: roomPrice.toLocaleString("vi-VN"),
        totalPrice: totalPrice.toLocaleString("vi-VN"),
        specialRequests,
        // policies,
      };

      await sendBookingConfirmation(email, emailPayloadBase);
      await sendBookingConfirmation("trongluffy22@gmail.com", emailPayloadBase);
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    // Auto create bill after booking and return it together with booking
    let createdBill: any = null;
    try {
      const tax = totalPrice * 0.08;
      const finalAmount = totalPrice + tax;
      const userId = (req as any).user?._id;

      const bill = await Bill.create({
        booking: booking._id,
        user: userId,
        customerInfo: {
          fullName,
          email,
          phone,
        },
        roomInfo: {
          roomId: room?._id,
          roomName: roomName || room?.name || roomType || "Standard Room",
          roomType: room?.type || roomType || "Standard",
          nightlyPrice: roomPrice,
        },
        bookingDetails: {
          roomName: roomName || room?.name || roomType || "Standard Room",
          roomType: room?.type || roomType || "Standard",
          nightlyPrice: roomPrice,
          nights,
          guests,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          specialRequests,
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
        paymentMethod: paymentMethod === "deposit" ? "deposit" : "full",
        paymentStatus: paymentMethod === "deposit" ? "unpaid" : "paid",
        specialRequests,
        status: "active",
        issuedDate: new Date(),
      });

      createdBill = await Bill.findById(bill._id)
        .populate("booking")
        .populate("user", "fullName email")
        .populate("roomInfo.roomId");
    } catch (billError) {
      console.error("Failed to create bill:", billError);
    }

    try {
      res
        .status(201)
        .json(
          successResponse(
            { booking: populatedBooking, bill: createdBill },
            "Booking and bill created successfully"
          )
        );
    } catch (responseError) {
      console.error("❌ Error sending response:", responseError);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error sending response",
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

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

    booking.status = "cancelled";
    await booking.save();

    res.json(successResponse(booking, "Booking cancelled successfully"));
  } catch (error) {
    next(error);
  }
};
