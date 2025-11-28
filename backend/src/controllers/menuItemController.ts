import { Request, Response, NextFunction } from "express";
import MenuItem from "../models/MenuItem";

// Get all menu items
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

    res.json(menuItems);
  } catch (error: any) {
    next(error);
  }
};

// Get menu items by category
export const getMenuItemsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.params;

    const menuItems = await MenuItem.find({
      category,
      isAvailable: true,
    }).sort({ name: 1 });

    res.json(menuItems);
  } catch (error: any) {
    next(error);
  }
};

// Get menu item by ID
export const getMenuItemById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json(menuItem);
  } catch (error: any) {
    next(error);
  }
};

// Create menu item (admin only)
export const createMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();

    res.status(201).json(menuItem);
  } catch (error: any) {
    next(error);
  }
};

// Update menu item (admin only)
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
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json(menuItem);
  } catch (error: any) {
    next(error);
  }
};

// Delete menu item (admin only)
export const deleteMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({ message: "Menu item deleted successfully" });
  } catch (error: any) {
    next(error);
  }
};

// Get all categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await MenuItem.distinct("category");
    res.json(categories);
  } catch (error: any) {
    next(error);
  }
};

// Get popular menu items (by rating)
export const getPopularMenuItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit = 10 } = req.query;

    const menuItems = await MenuItem.find({ isAvailable: true })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(Number(limit));

    res.json(menuItems);
  } catch (error: any) {
    next(error);
  }
};
