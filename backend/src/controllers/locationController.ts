import { Request, Response, NextFunction } from "express";
import Location from "../models/Location";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../middlewares/errorMiddleware";

export const getAllLocations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { city, isActive } = req.query;
    const filter: any = {};
    if (city) filter.city = city;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const locations = await Location.find(filter).sort({ city: 1, name: 1 });
    res.json(successResponse(locations));
  } catch (error) {
    next(error);
  }
};

export const getLocationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      throw new AppError("Location not found", 404);
    }
    res.json(successResponse(location));
  } catch (error) {
    next(error);
  }
};

export const getLocationsByCity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const locations = await Location.find({
      city: req.params.city,
      isActive: true,
    }).sort({ name: 1 });
    res.json(successResponse(locations));
  } catch (error) {
    next(error);
  }
};

export const createLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const location = await Location.create(req.body);
    res
      .status(201)
      .json(successResponse(location, "Location created successfully"));
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!location) {
      throw new AppError("Location not found", 404);
    }
    res.json(successResponse(location, "Location updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const deleteLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      throw new AppError("Location not found", 404);
    }
    res.json(successResponse(null, "Location deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export const getCities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cities = await Location.distinct("city", { isActive: true });
    res.json(successResponse(cities));
  } catch (error) {
    next(error);
  }
};
