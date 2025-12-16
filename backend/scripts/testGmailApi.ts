/**
 * Script kiểm tra Gmail API đã hoạt động chưa
 * Chạy: npx tsx scripts/testGmailApi.ts
 */

import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

async function testGmailApi() {
  console.log("\n🔍 KIỂM TRA CẤU HÌNH GMAIL API\n");
  console.log("=".repeat(50));

  // 1. Check env vars
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const gmailEmail = process.env.GMAIL_EMAIL || "hotelhub2202@gmail.com";

  console.log("\n📋 Kiểm tra biến môi trường:");
  console.log(`   GMAIL_CLIENT_ID: ${clientId ? "✅ Có" : "❌ Thiếu"}`);
  console.log(`   GMAIL_CLIENT_SECRET: ${clientSecret ? "✅ Có" : "❌ Thiếu"}`);
  console.log(`   GMAIL_REFRESH_TOKEN: ${refreshToken ? "✅ Có" : "❌ Thiếu"}`);
  console.log(`   GMAIL_EMAIL: ${gmailEmail}`);

  if (!clientId || !clientSecret || !refreshToken) {
    console.log("\n❌ THIẾU CẤU HÌNH GMAIL API!");
    console.log("\n📝 Hướng dẫn setup:");
    console.log("   1. Vào https://console.cloud.google.com/");
    console.log("   2. Tạo project mới hoặc chọn project có sẵn");
    console.log("   3. Vào 'APIs & Services' > 'Library'");
    console.log("   4. Tìm 'Gmail API' và Enable");
    console.log("   5. Vào 'APIs & Services' > 'Credentials'");
    console.log("   6. Tạo 'OAuth 2.0 Client ID' (Desktop app)");
    console.log("   7. Copy Client ID và Client Secret vào .env");
    console.log("   8. Chạy: npx tsx scripts/getGmailToken.ts");
    console.log("   9. Đăng nhập với tài khoản hotelhub2202@gmail.com");
    console.log("   10. Copy refresh_token vào .env\n");

    console.log("📄 Thêm vào file .env:");
    console.log("   GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com");
    console.log("   GMAIL_CLIENT_SECRET=your-client-secret");
    console.log("   GMAIL_REFRESH_TOKEN=your-refresh-token");
    console.log("   GMAIL_EMAIL=hotelhub2202@gmail.com\n");
    return;
  }

  // 2. Test API connection
  console.log("\n🔌 Kiểm tra kết nối Gmail API...");

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Get profile
    const profile = await gmail.users.getProfile({ userId: "me" });
    console.log(`   ✅ Kết nối thành công!`);
    console.log(`   📧 Email: ${profile.data.emailAddress}`);
    console.log(`   📬 Tổng số emails: ${profile.data.messagesTotal}`);

    // Get recent emails
    console.log("\n📥 10 emails gần nhất:");
    const messages = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });

    if (messages.data.messages && messages.data.messages.length > 0) {
      for (const msg of messages.data.messages.slice(0, 5)) {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "metadata",
          metadataHeaders: ["From", "Subject", "Date"],
        });

        const headers = detail.data.payload?.headers || [];
        const from = headers.find((h) => h.name === "From")?.value || "Unknown";
        const subject =
          headers.find((h) => h.name === "Subject")?.value || "(no subject)";
        const date = headers.find((h) => h.name === "Date")?.value || "";

        console.log(`   • From: ${from.substring(0, 40)}`);
        console.log(`     Subject: ${subject.substring(0, 50)}`);
        console.log(`     Date: ${date}`);
        console.log("");
      }
    } else {
      console.log("   (Không có emails)");
    }

    // Test search for specific sender
    const testSender = "trongluffy22@gmail.com";
    console.log(`\n🔎 Tìm emails từ ${testSender}:`);

    const searchResult = await gmail.users.messages.list({
      userId: "me",
      q: `from:${testSender}`,
      maxResults: 5,
    });

    if (searchResult.data.messages && searchResult.data.messages.length > 0) {
      console.log(
        `   ✅ Tìm thấy ${searchResult.data.messages.length} emails!`
      );

      for (const msg of searchResult.data.messages.slice(0, 3)) {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "metadata",
          metadataHeaders: ["Subject", "Date"],
        });

        const headers = detail.data.payload?.headers || [];
        const subject =
          headers.find((h) => h.name === "Subject")?.value || "(no subject)";
        const date = headers.find((h) => h.name === "Date")?.value || "";

        console.log(`   • ${subject}`);
        console.log(`     ${date}`);
      }
    } else {
      console.log(`   ❌ Không tìm thấy email nào từ ${testSender}`);
      console.log(
        `   → Hãy gửi email từ ${testSender} đến ${gmailEmail} và thử lại`
      );
    }

    console.log("\n✅ Gmail API đã sẵn sàng hoạt động!");
  } catch (error: any) {
    console.log(`   ❌ Lỗi kết nối: ${error.message}`);

    if (error.message.includes("invalid_grant")) {
      console.log("\n⚠️ Refresh token đã hết hạn hoặc không hợp lệ!");
      console.log("   → Chạy lại: npx tsx scripts/getGmailToken.ts");
    } else if (error.message.includes("invalid_client")) {
      console.log("\n⚠️ Client ID hoặc Client Secret không đúng!");
      console.log("   → Kiểm tra lại credentials trên Google Cloud Console");
    } else if (error.message.includes("access_denied")) {
      console.log("\n⚠️ Chưa cấp quyền đọc Gmail!");
      console.log("   → Chạy lại: npx tsx scripts/getGmailToken.ts");
      console.log(
        "   → Đảm bảo đăng nhập đúng tài khoản hotelhub2202@gmail.com"
      );
    }
  }

  console.log("\n" + "=".repeat(50) + "\n");
}

testGmailApi();
