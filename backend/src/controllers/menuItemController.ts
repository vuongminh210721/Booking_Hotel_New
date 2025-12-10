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
    const filter: any = {};
    if (category) filter.category = category;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

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
    const menuItems = await MenuItem.find({
      category: req.params.category,
      isAvailable: true,
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
    const menuItem = await MenuItem.create(req.body);
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
    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!menuItem) {
      throw new AppError("Menu item not found", 404);
    }
    res.json(successResponse(menuItem, "Menu item updated successfully"));
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
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      throw new AppError("Menu item not found", 404);
    }
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
    const categories = await MenuItem.distinct("category", {
      isAvailable: true,
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
    const menuItems = await MenuItem.find({ isAvailable: true })
      .sort({ orderCount: -1 })
      .limit(10);
    res.json(successResponse(menuItems));
  } catch (error) {
    next(error);
  }
};
