import { Request, Response, NextFunction } from "express";
import Promotion from "../models/Promotion";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../middlewares/errorMiddleware";

export const getAllPromotions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
    res.json(successResponse(promotions));
  } catch (error) {
    next(error);
  }
};

export const getPromotionByCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const promotion = await Promotion.findOne({
      code: req.params.code.toUpperCase(),
      isActive: true,
    });
    if (!promotion) {
      throw new AppError("Promotion not found", 404);
    }
    res.json(successResponse(promotion));
  } catch (error) {
    next(error);
  }
};

export const validatePromotion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code, bookingAmount, roomId } = req.body;

    const promotion = await Promotion.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!promotion) {
      throw new AppError("Invalid promotion code", 400);
    }

    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      throw new AppError("Promotion has expired", 400);
    }

    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      throw new AppError("Promotion usage limit reached", 400);
    }

    if (
      promotion.minBookingAmount &&
      bookingAmount < promotion.minBookingAmount
    ) {
      throw new AppError(
        `Minimum booking amount is ${promotion.minBookingAmount}`,
        400,
      );
    }

    if (promotion.applicableRooms && promotion.applicableRooms.length > 0) {
      if (!promotion.applicableRooms.includes(roomId)) {
        throw new AppError("Promotion not applicable for this room", 400);
      }
    }

    let discountAmount = 0;
    if (promotion.discountType === "percentage") {
      discountAmount = (bookingAmount * promotion.discountValue) / 100;
      if (promotion.maxDiscount) {
        discountAmount = Math.min(discountAmount, promotion.maxDiscount);
      }
    } else {
      discountAmount = promotion.discountValue;
    }

    res.json(
      successResponse(
        {
          valid: true,
          promotion,
          discountAmount,
          finalAmount: bookingAmount - discountAmount,
        },
        "Promotion is valid",
      ),
    );
  } catch (error) {
    next(error);
  }
};

export const createPromotion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const promotion = await Promotion.create(req.body);
    res
      .status(201)
      .json(successResponse(promotion, "Promotion created successfully"));
  } catch (error) {
    next(error);
  }
};

export const updatePromotion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!promotion) {
      throw new AppError("Promotion not found", 404);
    }
    res.json(successResponse(promotion, "Promotion updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const deletePromotion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) {
      throw new AppError("Promotion not found", 404);
    }
    res.json(successResponse(null, "Promotion deleted successfully"));
  } catch (error) {
    next(error);
  }
};
