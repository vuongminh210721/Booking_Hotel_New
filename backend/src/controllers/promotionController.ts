// controllers/promotionController.ts
import { Request, Response, NextFunction } from "express";
import Promotion from "../models/Promotion";
import CustomerReward from "../models/CustomerReward";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../middlewares/errorMiddleware";
import { AuthRequest } from "../middlewares/authMiddleware";
import Voucher from "../models/Voucher";

// Helper: Tạo hoặc lấy CustomerReward document
const getOrCreateReward = async (customerId: string) => {
  let reward = await CustomerReward.findOne({ customerId });
  if (!reward) {
    reward = await CustomerReward.create({ customerId });
  }
  return reward;
};

// 1. Lấy tất cả ưu đãi (public)
export const getPromotions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const promotions = await Promotion.find({
      isActive: true,
      $or: [
        { user: userId }, // User's own promotions
        { user: { $eq: null } }, // Global system promotions
      ],
    }).sort({
      createdAt: -1,
    });
    res.json(successResponse(promotions));
  } catch (error) {
    next(error);
  }
};

// 2. Đổi ưu đãi lấy voucher
export const redeemPromotion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { promotion } = req.body;

    if (!promotion || !promotion._id || !promotion.requiredPoints) {
      throw new AppError("Dữ liệu ưu đãi không hợp lệ", 400);
    }

    const reward = await getOrCreateReward(req.user._id);

    if (reward.points < promotion.requiredPoints) {
      throw new AppError("Không đủ điểm để đổi voucher này", 400);
    }

    reward.points -= promotion.requiredPoints;
    await reward.save();

    const voucherCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    let expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    if (promotion.validTo && !isNaN(Date.parse(promotion.validTo))) {
      const parsed = new Date(promotion.validTo);
      if (!isNaN(parsed.getTime())) {
        expiresAt = parsed;
      }
    }

    const voucher = await Voucher.create({
      customerId: req.user._id,
      promotionId: promotion._id,
      promotionDetails: promotion,
      voucherCode,
      pointsSpent: promotion.requiredPoints,
      expiresAt,
    });

    res.json(
      successResponse({
        voucherCode,
        promotionTitle: promotion.title,
        pointsSpent: promotion.requiredPoints,
        newPoints: reward.points,
        expiresAt: voucher.expiresAt,
        message: "Đổi voucher thành công!",
      })
    );
  } catch (error) {
    next(error);
  }
};

// 3. Lấy danh sách voucher của user
export const getMyVouchers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const vouchers = await Voucher.find({
      customerId: req.user._id,
    }).sort({ issuedAt: -1 });

    res.json(successResponse(vouchers));
  } catch (error) {
    next(error);
  }
};

// 4. Lấy thông tin điểm thưởng + trạng thái các trò chơi
export const getMyRewards = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const reward = await getOrCreateReward(req.user._id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Vòng quay - kiểm tra xem còn quay được mấy lần hôm nay
    const lastSpin = reward.lastSpinDate ? new Date(reward.lastSpinDate) : null;
    lastSpin?.setHours(0, 0, 0, 0);

    let spinsRemaining = 2; // Default 2 lượt
    if (lastSpin && lastSpin >= today) {
      // Hôm nay đã quay rồi - kiểm tra lượt còn
      const spinCountToday = reward.spinCountToday || 0;
      spinsRemaining = Math.max(0, 2 - spinCountToday);
    }

    // Bốc thăm may mắn
    const lastDraw = reward.lastLuckyDrawDate
      ? new Date(reward.lastLuckyDrawDate)
      : null;
    lastDraw?.setHours(0, 0, 0, 0);
    const canLuckyDrawToday = !lastDraw || lastDraw < today;

    res.json(
      successResponse({
        points: reward.points,
        quizCompleted: reward.quizCompleted,
        spinsRemaining, // <<< MỚI: số lượt quay còn lại hôm nay
        canLuckyDrawToday,
        todayLuckyDrawPoints: reward.todayLuckyDrawPoints || null,
      })
    );
  } catch (error) {
    next(error);
  }
};

// 5. Quay vòng quay - HỖ TRỢ 2 LƯỢT/NGÀY
export const spinWheel = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pointsEarned = 0 } = req.body;

    if (typeof pointsEarned !== "number" || pointsEarned < 0) {
      throw new AppError("Điểm không hợp lệ", 400);
    }

    const reward = await getOrCreateReward(req.user._id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Kiểm tra nếu là ngày hôm nay
    const lastSpinDate = reward.lastSpinDate
      ? new Date(reward.lastSpinDate)
      : null;
    lastSpinDate?.setHours(0, 0, 0, 0);

    let spinsUsedToday = 0;

    if (!lastSpinDate || lastSpinDate < today) {
      // HÔM NAY LẦN ĐẦU TIÊN
      spinsUsedToday = 0;
      reward.lastSpinDate = new Date();
    } else {
      // HÔM NAY ĐÃ QUAY RỒI - KIỂM TRA LƯỢT CÒN
      // Giả sử ta track số lần quay trong ngày
      if (reward.spinCountToday === undefined) {
        reward.spinCountToday = 0;
      }
      spinsUsedToday = reward.spinCountToday;

      if (spinsUsedToday >= 2) {
        throw new AppError(
          "Bạn đã quay đủ 2 lượt hôm nay. Hãy quay lại vào ngày mai!",
          400
        );
      }
    }

    // Cộng điểm (chỉ nếu > 0)
    if (pointsEarned > 0) {
      reward.points += pointsEarned;
    }
    reward.spinCountToday = spinsUsedToday + 1;
    await reward.save();

    res.json(
      successResponse({
        pointsEarned,
        newPoints: reward.points,
        spinsUsedToday: reward.spinCountToday,
        spinsRemaining: 2 - reward.spinCountToday,
        message:
          pointsEarned > 0
            ? `Chúc mừng! Bạn nhận được ${pointsEarned} điểm!`
            : "Chúc may mắn lần sau!",
      })
    );
  } catch (error) {
    next(error);
  }
};

// 6. Hoàn thành quiz - TỐI ĐA 1000 ĐIỂM (5 CÂU × 200)
export const completeQuiz = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { totalScore = 0 } = req.body;

    if (typeof totalScore !== "number" || totalScore < 0 || totalScore > 1000) {
      throw new AppError("Điểm không hợp lệ", 400);
    }

    const reward = await getOrCreateReward(req.user._id);

    if (reward.quizCompleted) {
      throw new AppError("Bạn đã hoàn thành quiz rồi!", 400);
    }

    reward.points += totalScore;
    reward.quizCompleted = true;
    await reward.save();

    res.json(
      successResponse({
        pointsEarned: totalScore,
        newTotalPoints: reward.points,
        message: `Tuyệt vời! Bạn nhận được ${totalScore} điểm thưởng!`,
      })
    );
  } catch (error) {
    next(error);
  }
};

// 7. BỐC THĂM MAY MẮN – ĐÃ SỬA HOÀN CHỈNH
export const luckyDraw = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const reward = await getOrCreateReward(req.user._id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDraw = reward.lastLuckyDrawDate
      ? new Date(reward.lastLuckyDrawDate)
      : null;
    lastDraw?.setHours(0, 0, 0, 0);

    let pointsEarned = 0;
    let alreadyDrawnToday = false;
    let message = "";

    if (lastDraw && lastDraw >= today) {
      // ĐÃ BỐC HÔM NAY
      alreadyDrawnToday = true;
      pointsEarned = 0;
      message = "Bạn đã bốc thăm hôm nay rồi! Quay lại vào ngày mai nhé.";
    } else {
      // CHƯA BỐC → RANDOM THẬT - Điểm từ 1000 đến 5000 (tăng dần)
      const prizes = [1000, 2000, 3000, 4000, 5000];
      pointsEarned = prizes[Math.floor(Math.random() * prizes.length)];

      reward.points += pointsEarned;
      reward.lastLuckyDrawDate = new Date();
      reward.todayLuckyDrawPoints = pointsEarned;

      message = `Chúc mừng! Bạn nhận được ${pointsEarned} điểm từ bốc thăm may mắn!`;
    }

    // Luôn save (nếu đã bốc rồi thì không thay đổi gì, nhưng an toàn)
    await reward.save();

    // RESPONSE NHẤT QUÁN – LUÔN CÓ ĐỦ FIELD
    res.json(
      successResponse({
        pointsEarned, // 0 nếu đã bốc, >0 nếu mới bốc
        newPoints: reward.points, // điểm mới nhất
        alreadyDrawnToday, // true/false rõ ràng
        todayLuckyDrawPoints: reward.todayLuckyDrawPoints || 0, // luôn có, để FE hiển thị
        message,
      })
    );
  } catch (error) {
    next(error);
  }
};

// 8. (Giữ lại) Cộng điểm thủ công (nếu cần sau này)
export const addPoints = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pointsEarned = 0 } = req.body;

    if (typeof pointsEarned !== "number" || pointsEarned <= 0) {
      throw new AppError("Điểm không hợp lệ", 400);
    }

    const reward = await getOrCreateReward(req.user._id);
    reward.points += pointsEarned;
    await reward.save();

    res.json(
      successResponse({
        pointsEarned,
        newPoints: reward.points,
        message: `Bạn nhận được ${pointsEarned} điểm!`,
      })
    );
  } catch (error) {
    next(error);
  }
};

// 9. Xác thực và áp dụng voucher code
export const applyVoucher = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { voucherCode, totalAmount } = req.body;

    if (!voucherCode) {
      throw new AppError("Vui lòng nhập mã voucher", 400);
    }

    // Tìm voucher theo code và user
    const voucher = await Voucher.findOne({
      voucherCode: voucherCode.toUpperCase(),
      customerId: req.user._id,
    });

    if (!voucher) {
      throw new AppError(
        "Mã voucher không tồn tại hoặc không thuộc về bạn",
        404
      );
    }

    // Kiểm tra trạng thái
    if (voucher.status === "used") {
      throw new AppError("Voucher này đã được sử dụng", 400);
    }

    if (voucher.status === "expired" || new Date() > voucher.expiresAt) {
      // Update status if expired
      if (voucher.status !== "expired") {
        voucher.status = "expired";
        await voucher.save();
      }
      throw new AppError("Voucher này đã hết hạn", 400);
    }

    // Parse discount từ promotionDetails
    const discountStr = voucher.promotionDetails.discount;
    let discountAmount = 0;
    let discountPercent = 0;

    // Parse discount string: "150k-200k tùy hạng", "25% cho toàn bộ", "15% – 20%"
    const percentMatch = discountStr.match(/(\d+)%/);
    const moneyMatch = discountStr.match(/(\d+)k/i);

    if (percentMatch) {
      discountPercent = parseInt(percentMatch[1]);
      discountAmount = Math.round((totalAmount * discountPercent) / 100);
    } else if (moneyMatch) {
      discountAmount = parseInt(moneyMatch[1]) * 1000;
    }

    // Không cho giảm quá totalAmount
    if (discountAmount > totalAmount) {
      discountAmount = totalAmount;
    }

    res.json(
      successResponse({
        valid: true,
        voucherCode: voucher.voucherCode,
        voucherId: voucher._id,
        promotionTitle: voucher.promotionDetails.title,
        discountDescription: voucher.promotionDetails.discount,
        discountAmount,
        discountPercent,
        originalAmount: totalAmount,
        finalAmount: totalAmount - discountAmount,
        expiresAt: voucher.expiresAt,
        message: `Áp dụng voucher thành công! Giảm ${discountAmount.toLocaleString(
          "vi-VN"
        )}đ`,
      })
    );
  } catch (error) {
    next(error);
  }
};

// 10. Đánh dấu voucher đã sử dụng sau khi thanh toán
export const useVoucher = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { voucherId } = req.body;

    if (!voucherId) {
      throw new AppError("Thiếu ID voucher", 400);
    }

    const voucher = await Voucher.findOne({
      _id: voucherId,
      customerId: req.user._id,
    });

    if (!voucher) {
      throw new AppError("Voucher không tồn tại", 404);
    }

    if (voucher.status === "used") {
      throw new AppError("Voucher đã được sử dụng", 400);
    }

    voucher.status = "used";
    voucher.usedAt = new Date();
    await voucher.save();

    res.json(
      successResponse({
        message: "Đã sử dụng voucher thành công",
        voucherId: voucher._id,
      })
    );
  } catch (error) {
    next(error);
  }
};
