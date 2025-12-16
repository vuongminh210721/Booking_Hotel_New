import { Request, Response, NextFunction } from "express";
import Room from "../models/Room";
import {
  successResponse,
  errorResponse,
  paginationResponse,
} from "../utils/responseFormatter";
import { AppError } from "../middlewares/errorMiddleware";

export const getAllRooms = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, minPrice, maxPrice, location } = req.query;
    const userId = (req as any).user?._id;

    const filter: any = { availability: true, soldOut: false };
    if (type) filter.type = type;
    if (location) filter.location = location;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Get user-specific rooms OR global rooms (where user is null/undefined)
    filter.$or = [
      { user: userId }, // User's own rooms
      { user: { $eq: null } }, // Global system rooms
    ];

    // Tự động đánh dấu soldOut nếu quantity = 0
    const rooms = await Room.find(filter).sort({ createdAt: -1 });

    // Cập nhật soldOut status cho các phòng có quantity = 0
    const updatePromises = rooms.map(async (room) => {
      if (room.quantity <= 0 && !room.soldOut) {
        await Room.findByIdAndUpdate(room._id, { soldOut: true });
        room.soldOut = true;
      }
      return room;
    });

    await Promise.all(updatePromises);

    // Trả lại tất cả phòng, bao gồm hết phòng (quantity = 0)
    res.json(successResponse(rooms));
  } catch (error) {
    next(error);
  }
};

export const getRoomsByLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const rooms = await Room.find({
      location: req.params.location,
      availability: true,
      $or: [
        { user: userId }, // User's own rooms
        { user: { $eq: null } }, // Global system rooms
      ],
    });
    res.json(successResponse(rooms));
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      throw new AppError("Room not found", 404);
    }
    res.json(successResponse(room));
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const roomData = { ...req.body, user: userId };
    const room = await Room.create(roomData);
    res.status(201).json(successResponse(room, "Room created successfully"));
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const room = await Room.findOne({
      _id: req.params.id,
      $or: [
        { user: userId }, // User's own room
        { user: { $eq: null } }, // Global system room
      ],
    });
    if (!room) {
      throw new AppError(
        "Room not found or you don't have permission to update",
        404
      );
    }
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(successResponse(updatedRoom, "Room updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const room = await Room.findOne({
      _id: req.params.id,
      $or: [
        { user: userId }, // User's own room
        { user: { $eq: null } }, // Global system room
      ],
    });
    if (!room) {
      throw new AppError(
        "Room not found or you don't have permission to delete",
        404
      );
    }
    await Room.findByIdAndDelete(req.params.id);
    res.json(successResponse(null, "Room deleted successfully"));
  } catch (error) {
    next(error);
  }
};
