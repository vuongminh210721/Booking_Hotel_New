import { Request, Response, NextFunction } from "express";
import Policy from "../models/Policy";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../middlewares/errorMiddleware";

export const getAllPolicies = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const policies = await Policy.find({ isActive: true });
    res.json(successResponse(policies));
  } catch (error) {
    next(error);
  }
};

export const getPolicyBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const policy = await Policy.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!policy) {
      throw new AppError("Policy not found", 404);
    }
    res.json(successResponse(policy));
  } catch (error) {
    next(error);
  }
};

export const createPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const policy = await Policy.create(req.body);
    res
      .status(201)
      .json(successResponse(policy, "Policy created successfully"));
  } catch (error) {
    next(error);
  }
};

export const updatePolicy = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!policy) {
      throw new AppError("Policy not found", 404);
    }
    res.json(successResponse(policy, "Policy updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const deletePolicy = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);
    if (!policy) {
      throw new AppError("Policy not found", 404);
    }
    res.json(successResponse(null, "Policy deleted successfully"));
  } catch (error) {
    next(error);
  }
};
