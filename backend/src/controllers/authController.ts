import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../middlewares/errorMiddleware";
import { generateToken } from "../utils/token";
import { AuthRequest } from "../middlewares/authMiddleware";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fullName, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Email already registered", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });

    const token = generateToken(user._id.toString());

    res.status(201).json(
      successResponse(
        {
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            address: user.address,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            hometown: user.hometown,
            customerType: user.customerType,
            bookedRooms: user.bookedRooms,
            role: user.role,
          },
          token,
        },
        "Registration successful"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken(user._id.toString());

    res.json(
      successResponse(
        {
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            address: user.address,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            hometown: user.hometown,
            customerType: user.customerType,
            bookedRooms: user.bookedRooms,
            role: user.role,
          },
          token,
        },
        "Login successful"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json(
      successResponse({
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        address: user.address,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        hometown: user.hometown,
        customerType: user.customerType,
        bookedRooms: user.bookedRooms,
        role: user.role,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      gender,
      dateOfBirth,
      hometown,
      customerType,
    } = req.body;

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (email) {
      // Kiểm tra email mới có trùng với user khác không
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user._id },
      });
      if (existingUser) {
        throw new AppError("Email đã được sử dụng bởi tài khoản khác", 400);
      }
      updateData.email = email;
    }
    if (phone) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (gender) updateData.gender = gender;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (hometown !== undefined) updateData.hometown = hometown;
    if (customerType) updateData.customerType = customerType;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json(
      successResponse(
        {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          address: user.address,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          hometown: user.hometown,
          customerType: user.customerType,
          bookedRooms: user.bookedRooms,
          role: user.role,
        },
        "Profile updated successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    // Tạo URL cho avatar (relative path)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Cập nhật user với avatar mới
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl },
      { new: true, runValidators: true }
    );

    res.json(
      successResponse(
        { avatarUrl: user?.avatarUrl },
        "Avatar uploaded successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};
