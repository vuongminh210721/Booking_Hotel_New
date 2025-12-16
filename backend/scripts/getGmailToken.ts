/**
 * Script để lấy Gmail Refresh Token
 *
 * Cách dùng:
 * 1. Đã có GMAIL_CLIENT_ID và GMAIL_CLIENT_SECRET trong .env
 * 2. Chạy: npx tsx scripts/getGmailToken.ts
 * 3. Mở URL trong console, đăng nhập Gmail hotelhub2202@gmail.com
 * 4. Copy refresh_token và thêm vào .env
 */

import { google } from "googleapis";
import * as http from "http";
import * as url from "url";
import open from "open";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3333/oauth2callback";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

async function main() {
  console.log("\n🔐 Gmail OAuth2 Token Generator\n");

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error(
      "❌ Thiếu GMAIL_CLIENT_ID hoặc GMAIL_CLIENT_SECRET trong .env"
    );
    console.log("\nVui lòng thêm vào file .env:");
    console.log("GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com");
    console.log("GMAIL_CLIENT_SECRET=your-client-secret\n");
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log(
    "📋 Mở URL sau trong trình duyệt và đăng nhập với hotelhub2202@gmail.com:\n"
  );
  console.log(authUrl);
  console.log("\n⏳ Đang chờ authorization...\n");

  // Create a local server to receive the OAuth callback
  const server = http.createServer(async (req, res) => {
    if (req.url?.startsWith("/oauth2callback")) {
      const qs = new url.URL(req.url, "http://localhost:3333").searchParams;
      const code = qs.get("code");

      if (code) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
          "<h1>✅ Authorization successful! Bạn có thể đóng tab này.</h1>"
        );

        try {
          const { tokens } = await oauth2Client.getToken(code);

          console.log("✅ Đã lấy được tokens!\n");
          console.log("📝 Thêm các dòng sau vào file .env:\n");
          console.log(`GMAIL_CLIENT_ID=${CLIENT_ID}`);
          console.log(`GMAIL_CLIENT_SECRET=${CLIENT_SECRET}`);
          console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
          console.log(`GMAIL_EMAIL=hotelhub2202@gmail.com\n`);
        } catch (err) {
          console.error("❌ Lỗi khi lấy token:", err);
        }

        server.close();
        process.exit(0);
      }
    }
  });

  server.listen(3333, () => {
    console.log("🌐 Server đang chạy tại http://localhost:3333");
    console.log("   Đang chờ OAuth callback...\n");

    // Try to open browser automatically
    try {
      open(authUrl);
    } catch {
      console.log(
        "⚠️ Không thể mở trình duyệt tự động. Vui lòng mở URL ở trên thủ công.\n"
      );
    }
  });
}

main().catch(console.error);
