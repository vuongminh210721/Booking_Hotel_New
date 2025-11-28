import { Request, Response, NextFunction } from "express";
import Review from "../models/Review";
import mongoose from "mongoose";

// Get all reviews
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
      .populate("user", "fullName avatarUrl")
      .populate("room", "name location")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Review.countDocuments(filter);

    res.json({
      reviews,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Get review by ID
export const getReviewById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("user", "fullName avatarUrl")
      .populate("room", "name location");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json(review);
  } catch (error: any) {
    next(error);
  }
};

// Create review (requires authentication)
export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { room, hotelName, rating, comment, images } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const review = new Review({
      user: userId,
      room,
      hotelName,
      rating,
      comment,
      images: images || [],
      isVerified: false, // Can be set to true if user has a confirmed booking
    });

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate("user", "fullName avatarUrl")
      .populate("room", "name location");

    res.status(201).json(populatedReview);
  } catch (error: any) {
    next(error);
  }
};

// Update review (only by owner)
export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rating, comment, images } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user is the owner of the review
    if (review.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this review" });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be between 1 and 5" });
      }
      review.rating = rating;
    }
    if (comment) review.comment = comment;
    if (images) review.images = images;

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate("user", "fullName avatarUrl")
      .populate("room", "name location");

    res.json(updatedReview);
  } catch (error: any) {
    next(error);
  }
};

// Delete review (only by owner)
export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user is the owner of the review
    if (review.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review" });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: "Review deleted successfully" });
  } catch (error: any) {
    next(error);
  }
};

// Mark review as helpful
export const markHelpful = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.helpful += 1;
    await review.save();

    res.json({ helpful: review.helpful });
  } catch (error: any) {
    next(error);
  }
};

// Get reviews by user
export const getUserReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId || (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const reviews = await Review.find({ user: userId })
      .populate("room", "name location images")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error: any) {
    next(error);
  }
};

// Get reviews by room
export const getRoomReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({ room: roomId })
      .populate("user", "fullName avatarUrl")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Review.countDocuments({ room: roomId });

    // Calculate average rating
    const avgResult = await Review.aggregate([
      { $match: { room: new mongoose.Types.ObjectId(roomId) } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);

    const avgRating = avgResult.length > 0 ? avgResult[0].avgRating : 0;

    res.json({
      reviews,
      stats: {
        total,
        avgRating: Math.round(avgRating * 10) / 10,
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    next(error);
  }
};
