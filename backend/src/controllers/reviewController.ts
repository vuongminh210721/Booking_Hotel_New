import { Request, Response, NextFunction } from "express";
import Review from "../models/Review";
import Room from "../models/Room";
import {
  successResponse,
  paginationResponse,
} from "../utils/responseFormatter";
import { AppError } from "../middlewares/errorMiddleware";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getAllReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { room, rating, limit = 20, page = 1 } = req.query;
    const filter: any = {};
    if (room) filter.room = room;
    if (rating) filter.rating = Number(rating);

    const skip = (Number(page) - 1) * Number(limit);
    const reviews = await Review.find(filter)
      .populate("room", "name type location")
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Review.countDocuments(filter);
    res.json(paginationResponse(reviews, Number(page), Number(limit), total));
  } catch (error) {
    next(error);
  }
};

export const getReviewById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("room", "name type location")
      .populate("user", "fullName email");
    if (!review) {
      throw new AppError("Review not found", 404);
    }
    res.json(successResponse(review));
  } catch (error) {
    next(error);
  }
};

export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId, rating, comment, images } = req.body;
    const room = await Room.findById(roomId);
    if (!room) {
      throw new AppError("Room not found", 404);
    }

    const existingReview = await Review.findOne({
      room: roomId,
      user: req.user._id,
    });
    if (existingReview) {
      throw new AppError("You have already reviewed this room", 400);
    }

    const review = await Review.create({
      room: roomId,
      user: req.user._id,
      rating,
      comment,
      images: images || [],
    });

    const populatedReview = await Review.findById(review._id)
      .populate("room", "name type location")
      .populate("user", "fullName email");

    res
      .status(201)
      .json(successResponse(populatedReview, "Review created successfully"));
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (review.user.toString() !== req.user._id.toString()) {
      throw new AppError("You can only update your own reviews", 403);
    }

    const { rating, comment, images } = req.body;
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.images = images || review.images;
    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate("room", "name type location")
      .populate("user", "fullName email");

    res.json(successResponse(populatedReview, "Review updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (review.user.toString() !== req.user._id.toString()) {
      throw new AppError("You can only delete your own reviews", 403);
    }

    await review.deleteOne();
    res.json(successResponse(null, "Review deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export const markHelpful = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    review.helpfulCount = (review.helpfulCount || 0) + 1;
    await review.save();

    res.json(successResponse(review, "Marked as helpful"));
  } catch (error) {
    next(error);
  }
};

export const getUserReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate("room", "name type location images")
      .sort({ createdAt: -1 });

    res.json(successResponse(reviews));
  } catch (error) {
    next(error);
  }
};

export const getRoomReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviews = await Review.find({ room: req.params.roomId })
      .populate("user", "fullName")
      .sort({ createdAt: -1 });

    res.json(successResponse(reviews));
  } catch (error) {
    next(error);
  }
};
