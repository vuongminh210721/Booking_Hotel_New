import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

export const sendBookingConfirmation = async (
  email: string,
  bookingDetails: any
) => {
  const subject = "✅ Xác nhận đặt phòng - HOTELHUB";

  // Format policies
  const policiesHtml =
    bookingDetails.policies
      ?.map(
        (policy: any) => `
      <div style="margin-bottom: 15px;">
        <h4 style="color: #0d9488; margin: 0 0 8px 0; font-size: 14px;">${policy.title}</h4>
        <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6;">${policy.content.substring(0, 200)}${policy.content.length > 200 ? "..." : ""}</p>
      </div>
    `
      )
      .join("") || "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận đặt phòng</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">HOTELHUB</h1>
      <p style="color: #e0f2f1; margin: 10px 0 0 0; font-size: 16px;">Xác nhận đặt phòng thành công</p>
    </div>

    <!-- Booking Confirmed Icon -->
    <div style="text-align: center; padding: 30px 0 20px 0;">
      <div style="width: 80px; height: 80px; background-color: #d1fae5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
        <span style="color: #059669; font-size: 40px;">✓</span>
      </div>
    </div>

    <!-- Main Content -->
    <div style="padding: 0 30px 30px 30px;">
      
      <h2 style="color: #1f2937; font-size: 22px; margin: 0 0 10px 0;">Kính chào ${bookingDetails.fullName}!</h2>
      <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
        Cảm ơn bạn đã đặt phòng tại <strong style="color: #0d9488;">HOTELHUB</strong>. Chúng tôi rất vui được phục vụ bạn!
      </p>

      <!-- Booking ID -->
      <div style="background-color: #f9fafb; border-left: 4px solid #0d9488; padding: 15px; margin-bottom: 25px;">
        <p style="margin: 0; color: #6b7280; font-size: 13px;">Mã đặt phòng</p>
        <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 18px; font-weight: 600;">#${bookingDetails.bookingId}</p>
      </div>

      <!-- Room Information -->
      <div style="border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 25px;">
        ${
          bookingDetails.room.images && bookingDetails.room.images[0]
            ? `<img src="${bookingDetails.room.images[0]}" alt="${bookingDetails.room.name}" style="width: 100%; height: 200px; object-fit: cover; display: block;" />`
            : ""
        }
        <div style="padding: 20px;">
          <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 15px 0;">${bookingDetails.room.name}</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px;">
            <div>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">Loại phòng</p>
              <p style="margin: 4px 0 0 0; color: #374151; font-size: 14px; font-weight: 600;">${bookingDetails.room.type}</p>
            </div>
            <div>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">Diện tích</p>
              <p style="margin: 4px 0 0 0; color: #374151; font-size: 14px; font-weight: 600;">${bookingDetails.room.size}</p>
            </div>
            <div>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">Loại giường</p>
              <p style="margin: 4px 0 0 0; color: #374151; font-size: 14px; font-weight: 600;">${bookingDetails.room.bedType}</p>
            </div>
            <div>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">Địa điểm</p>
              <p style="margin: 4px 0 0 0; color: #374151; font-size: 14px; font-weight: 600;">${bookingDetails.room.location}</p>
            </div>
          </div>

          ${
            bookingDetails.room.amenities &&
            bookingDetails.room.amenities.length > 0
              ? `
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600;">Tiện nghi:</p>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${bookingDetails.room.amenities
                .slice(0, 6)
                .map(
                  (amenity: string) => `
                <span style="background-color: #f0fdfa; color: #0d9488; padding: 6px 12px; border-radius: 6px; font-size: 12px; display: inline-block;">
                  ${amenity}
                </span>
              `
                )
                .join("")}
            </div>
          </div>
          `
              : ""
          }
        </div>
      </div>

      <!-- Booking Details -->
      <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
        <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">Chi tiết đặt phòng</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Họ và tên</span>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
              <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${bookingDetails.fullName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Email</span>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
              <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${bookingDetails.email}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Số điện thoại</span>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
              <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${bookingDetails.phone}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Nhận phòng</span>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
              <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${bookingDetails.checkIn}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Trả phòng</span>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
              <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${bookingDetails.checkOut}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Số đêm</span>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
              <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${bookingDetails.nights} đêm</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Số khách</span>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
              <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${bookingDetails.guests} người</span>
            </td>
          </tr>
          ${
            bookingDetails.specialRequests
              ? `
          <tr>
            <td colspan="2" style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Yêu cầu đặc biệt</span>
              <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 14px;">${bookingDetails.specialRequests}</p>
            </td>
          </tr>
          `
              : ""
          }
        </table>
      </div>

      <!-- Price Breakdown -->
      <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px;">
        <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">Tổng chi phí</h3>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #6b7280; font-size: 14px;">${bookingDetails.roomPrice} VND × ${bookingDetails.nights} đêm</span>
          <span style="color: #374151; font-size: 14px; font-weight: 600;">${bookingDetails.totalPrice} VND</span>
        </div>
        
        <div style="border-top: 2px dashed #0d9488; margin: 15px 0; padding-top: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #1f2937; font-size: 16px; font-weight: 700;">Tổng cộng</span>
            <span style="color: #0d9488; font-size: 24px; font-weight: 700;">${bookingDetails.totalPrice} VND</span>
          </div>
        </div>
      </div>

      ${
        policiesHtml
          ? `
      <!-- Policies -->
      <div style="background-color: #fffbeb; border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid #fde68a;">
        <h3 style="color: #92400e; font-size: 18px; margin: 0 0 15px 0;">📋 Chính sách quan trọng</h3>
        ${policiesHtml}
        <p style="margin: 15px 0 0 0; font-size: 13px; color: #78716c;">
          Vui lòng đọc kỹ các chính sách trước khi nhận phòng.
        </p>
      </div>
      `
          : ""
      }

      <!-- Contact Info -->
      <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
        <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 10px 0;">Cần hỗ trợ?</h3>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
          📞 Hotline: <strong style="color: #0d9488;">1900 888 369</strong><br>
          📧 Email: <strong style="color: #0d9488;">booking@hotelhub.vn</strong><br>
          🌐 Website: <strong style="color: #0d9488;">www.hotelhub.vn</strong>
        </p>
      </div>

      <p style="color: #9ca3af; font-size: 13px; text-align: center; line-height: 1.6; margin: 20px 0 0 0;">
        Email này được gửi tự động, vui lòng không trả lời.<br>
        Nếu bạn không thực hiện đặt phòng này, vui lòng liên hệ ngay với chúng tôi.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #1f2937; padding: 30px; text-align: center;">
      <p style="color: #9ca3af; font-size: 13px; margin: 0 0 10px 0;">
        © 2025 HOTELHUB. All rights reserved.
      </p>
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        Hà Nội | TP. Hồ Chí Minh | Đà Nẵng
      </p>
    </div>

  </div>
</body>
</html>
  `;

  await sendEmail(email, subject, html);
};
