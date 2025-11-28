import { Request, Response, NextFunction } from "express";
import Service from "../models/Service";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../middlewares/errorMiddleware";

export const getAllServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, isAvailable } = req.query;

    const filter: any = {};
    if (category) filter.category = category;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";

    const services = await Service.find(filter).sort({ title: 1 });
    res.json(successResponse(services));
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      throw new AppError("Service not found", 404);
    }
    res.json(successResponse(service));
  } catch (error) {
    next(error);
  }
};

export const createService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const service = await Service.create(req.body);
    res
      .status(201)
      .json(successResponse(service, "Service created successfully"));
  } catch (error) {
    next(error);
  }
};

export const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) {
      throw new AppError("Service not found", 404);
    }
    res.json(successResponse(service, "Service updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      throw new AppError("Service not found", 404);
    }
    res.json(successResponse(null, "Service deleted successfully"));
  } catch (error) {
    next(error);
  }
};
