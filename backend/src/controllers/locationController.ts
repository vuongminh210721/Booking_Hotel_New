import { Request, Response, NextFunction } from "express";
import Location from "../models/Location";

// Get all locations
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

    res.json(locations);
  } catch (error: any) {
    next(error);
  }
};

// Get location by ID
export const getLocationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.json(location);
  } catch (error: any) {
    next(error);
  }
};

// Get locations by city
export const getLocationsByCity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { city } = req.params;

    const locations = await Location.find({
      city,
      isActive: true,
    }).sort({ name: 1 });

    res.json(locations);
  } catch (error: any) {
    next(error);
  }
};

// Create location (admin only)
export const createLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const location = new Location(req.body);
    await location.save();

    res.status(201).json(location);
  } catch (error: any) {
    next(error);
  }
};

// Update location (admin only)
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
      return res.status(404).json({ message: "Location not found" });
    }

    res.json(location);
  } catch (error: any) {
    next(error);
  }
};

// Delete location (admin only)
export const deleteLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.json({ message: "Location deleted successfully" });
  } catch (error: any) {
    next(error);
  }
};

// Get all cities
export const getCities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cities = await Location.distinct("city", { isActive: true });
    res.json(cities);
  } catch (error: any) {
    next(error);
  }
};
