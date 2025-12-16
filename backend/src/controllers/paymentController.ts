import { Request, Response } from "express";
import gmailService from "../services/gmailService";
import Bill from "../models/Bill";
import { AuthRequest } from "../middlewares/authMiddleware";

/**
 * POST /api/payments/verify-email
 * Kiểm tra xem user đã gửi email xác nhận thanh toán chưa
 * Nếu thành công, cập nhật tất cả bills của user từ unpaid -> paid
 *
 * Body: { userEmail: string, timeoutSeconds?: number, billIds?: string[] }
 * Response: { success: boolean, message: string, updatedBills?: number }
 */
export const verifyEmailPayment = async (req: Request, res: Response) => {
  try {
    const { userEmail, timeoutSeconds = 120, billIds } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "Thiếu userEmail trong request body",
      });
    }

    console.log(`\n🔄 Bắt đầu xác thực thanh toán qua email`);
    console.log(`   User email: ${userEmail}`);
    console.log(`   Timeout: ${timeoutSeconds}s`);
    if (billIds) {
      console.log(`   Bill IDs: ${billIds.join(", ")}`);
    }

    const timeoutMs = timeoutSeconds * 1000;
    const emailReceived = await gmailService.waitForEmailFromUser(
      userEmail,
      timeoutMs
    );

    if (emailReceived) {
      // Cập nhật trạng thái bill thành paid
      let updatedCount = 0;

      try {
        // Tìm user từ email
        const query: any = {
          "customerInfo.email": userEmail,
          paymentStatus: { $ne: "paid" }, // Chỉ cập nhật các bill chưa thanh toán
        };

        // Nếu có billIds cụ thể, chỉ cập nhật những bill đó
        if (billIds && Array.isArray(billIds) && billIds.length > 0) {
          query._id = { $in: billIds };
        }

        const result = await Bill.updateMany(query, {
          $set: {
            paymentStatus: "paid",
            paymentMethod: "paid",
          },
        });

        updatedCount = result.modifiedCount;
        console.log(`✅ Đã cập nhật ${updatedCount} bills thành paid`);
      } catch (updateError) {
        console.error("⚠️ Lỗi khi cập nhật bills:", updateError);
      }

      return res.json({
        success: true,
        message: "Thanh toán thành công! Đã nhận được email xác nhận.",
        updatedBills: updatedCount,
      });
    } else {
      return res.json({
        success: false,
        message:
          "Hết thời gian chờ. Không nhận được email xác nhận thanh toán.",
      });
    }
  } catch (error) {
    console.error("❌ Lỗi xác thực email payment:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra email. Vui lòng thử lại.",
    });
  }
};
