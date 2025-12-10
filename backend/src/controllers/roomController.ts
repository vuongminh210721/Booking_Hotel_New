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

    const filter: any = { availability: true, soldOut: false };
    if (type) filter.type = type;
    if (location) filter.location = location;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const rooms = await Room.find(filter).sort({ createdAt: -1 });
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
    const rooms = await Room.find({
      location: req.params.location,
      availability: true,
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
    const room = await Room.create(req.body);
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
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!room) {
      throw new AppError("Room not found", 404);
    }
    res.json(successResponse(room, "Room updated successfully"));
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
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      throw new AppError("Room not found", 404);
    }
    res.json(successResponse(null, "Room deleted successfully"));
  } catch (error) {
    next(error);
  }
};
