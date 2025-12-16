import { Request, Response, NextFunction } from "express";
import MenuItem from "../models/MenuItem";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../middlewares/errorMiddleware";

export const getAllMenuItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, isAvailable, search } = req.query;
    const userId = (req as any).user?._id;
    const filter: any = {};
    if (category) filter.category = category;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Get user-specific items OR global items
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { user: userId }, // User's own items
        { user: { $eq: null } }, // Global system items
      ],
    });

    const menuItems = await MenuItem.find(filter).sort({
      category: 1,
      name: 1,
    });
    res.json(successResponse(menuItems));
  } catch (error) {
    next(error);
  }
};

export const getMenuItemsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const menuItems = await MenuItem.find({
      category: req.params.category,
      isAvailable: true,
      $or: [
        { user: userId }, // User's own items
        { user: { $eq: null } }, // Global system items
      ],
    }).sort({ name: 1 });
    res.json(successResponse(menuItems));
  } catch (error) {
    next(error);
  }
};

export const getMenuItemById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      throw new AppError("Menu item not found", 404);
    }
    res.json(successResponse(menuItem));
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const menuItemData = { ...req.body, user: userId };
    const menuItem = await MenuItem.create(menuItemData);
    res
      .status(201)
      .json(successResponse(menuItem, "Menu item created successfully"));
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      $or: [
        { user: userId }, // User's own item
        { user: { $eq: null } }, // Global system item
      ],
    });
    if (!menuItem) {
      throw new AppError(
        "Menu item not found or you don't have permission to update",
        404
      );
    }
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.json(successResponse(updatedItem, "Menu item updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      $or: [
        { user: userId }, // User's own item
        { user: { $eq: null } }, // Global system item
      ],
    });
    if (!menuItem) {
      throw new AppError(
        "Menu item not found or you don't have permission to delete",
        404
      );
    }
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json(successResponse(null, "Menu item deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const categories = await MenuItem.distinct("category", {
      isAvailable: true,
      $or: [
        { user: userId }, // User's own items
        { user: { $eq: null } }, // Global system items
      ],
    });
    res.json(successResponse(categories));
  } catch (error) {
    next(error);
  }
};

export const getPopularMenuItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const menuItems = await MenuItem.find({
      isAvailable: true,
      $or: [
        { user: userId }, // User's own items
        { user: { $eq: null } }, // Global system items
      ],
    })
      .sort({ orderCount: -1 })
      .limit(10);
    res.json(successResponse(menuItems));
  } catch (error) {
    next(error);
  }
};
