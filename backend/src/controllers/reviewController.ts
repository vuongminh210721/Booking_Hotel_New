import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Review from "../models/Review";
import { successResponse, errorResponse } from "../utils/responseFormatter";
import { analyzeSentimentFromVietnamese } from "../services/sentimentService";

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized"));
    }

    const { hotelName, location, rating, comment } = req.body;

    if (!hotelName || !location || !rating || !comment) {
      return res
        .status(400)
        .json(
          errorResponse("hotelName, location, rating, comment are required")
        );
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json(errorResponse("rating must be 1-5"));
    }

    const review = await Review.create({
      user: userId,
      hotelName,
      location,
      rating,
      comment,
    });

    const populated = await review.populate({
      path: "user",
      select: "fullName avatarUrl",
    });

    return res.status(201).json(successResponse(populated, "Review created"));
  } catch (error: any) {
    return res
      .status(500)
      .json(errorResponse(error?.message || "Failed to create review"));
  }
};

export const getMyReviews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized"));
    }

    const reviews = await Review.find({ user: userId })
      .populate({ path: "user", select: "fullName avatarUrl" })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(successResponse(reviews));
  } catch (error: any) {
    return res
      .status(500)
      .json(errorResponse(error?.message || "Failed to fetch reviews"));
  }
};

export const getAllReviews = async (_req: Request, res: Response) => {
  try {
    let reviews = await Review.find({})
      .populate({ path: "user", select: "fullName avatarUrl" })
      .sort({ createdAt: -1 })
      .lean();

    if (reviews.length === 0) {
      return res.json(successResponse([]));
    }

    const enrichedReviews = await Promise.all(
      reviews.map(async (review: any) => {
        let sentimentScore = 0;

        try {
          const sentiment = await analyzeSentimentFromVietnamese(review.comment);
          sentimentScore = sentiment.label === "positive" ? sentiment.score : -sentiment.score;
        } catch (error) {
          sentimentScore = (review.rating - 3) / 2;
        }

        return {
          ...review,
          _sentimentScore: sentimentScore,
        };
      })
    );

    const sortedReviews = enrichedReviews.sort((a: any, b: any) => {
      return b._sentimentScore - a._sentimentScore || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const cleanReviews = sortedReviews.map(({ _sentimentScore, ...rest }) => rest);

    return res.json(successResponse(cleanReviews));
  } catch (error: any) {
    return res
      .status(500)
      .json(errorResponse(error?.message || "Failed to fetch reviews"));
  }
};

export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized"));
    }

    const { id } = req.params;
    const { hotelName, location, rating, comment } = req.body;

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json(errorResponse("rating must be 1-5"));
    }

    const updatePayload: any = {};
    if (hotelName !== undefined) updatePayload.hotelName = hotelName;
    if (location !== undefined) updatePayload.location = location;
    if (rating !== undefined) updatePayload.rating = rating;
    if (comment !== undefined) updatePayload.comment = comment;

    const review = await Review.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).populate({ path: "user", select: "fullName avatarUrl" });

    if (!review) {
      return res.status(404).json(errorResponse("Review not found"));
    }

    return res.json(successResponse(review, "Review updated"));
  } catch (error: any) {
    return res
      .status(500)
      .json(errorResponse(error?.message || "Failed to update review"));
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized"));
    }

    const { id } = req.params;

    const review = await Review.findOneAndDelete({ _id: id, user: userId });

    if (!review) {
      return res.status(404).json(errorResponse("Review not found"));
    }

    return res.json(successResponse(null, "Review deleted"));
  } catch (error: any) {
    return res
      .status(500)
      .json(errorResponse(error?.message || "Failed to delete review"));
  }
};

