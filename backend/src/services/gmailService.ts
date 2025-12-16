import { google } from "googleapis";
import { config } from "../utils/env";

const oauth2Client = new google.auth.OAuth2(
  config.gmailClientId,
  config.gmailClientSecret
);

if (config.gmailRefreshToken) {
  oauth2Client.setCredentials({ refresh_token: config.gmailRefreshToken });
}

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

/**
 * Check if there's any email from a specific sender after a given timestamp
 */
async function hasEmailFromSender(
  senderEmail: string,
  afterTimestamp: Date
): Promise<boolean> {
  const epochSeconds = Math.floor(afterTimestamp.getTime() / 1000);
  const query = `from:${senderEmail} after:${epochSeconds}`;

  const res = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 1,
  });

  return (res.data.messages?.length ?? 0) > 0;
}

/**
 * Wait for email from user within timeout period
 * Polls every 5 seconds for up to timeoutMs milliseconds
 * @returns true if email received, false if timeout
 */
async function waitForEmailFromUser(
  userEmail: string,
  timeoutMs: number = 60000,
  pollIntervalMs: number = 5000
): Promise<boolean> {
  // Check if Gmail is configured
  if (
    !config.gmailRefreshToken ||
    config.gmailRefreshToken === "your-refresh-token"
  ) {
    console.log(
      "⚠️ Gmail API chưa được cấu hình - chờ hết timeout rồi trả về false"
    );
    await new Promise((resolve) => setTimeout(resolve, timeoutMs));
    return false;
  }

  const startTime = new Date();
  const endTime = startTime.getTime() + timeoutMs;
  let attempts = 0;

  console.log(`\n📧 Bắt đầu kiểm tra email từ: ${userEmail}`);
  console.log(
    `   Timeout: ${timeoutMs / 1000}s, Poll interval: ${pollIntervalMs / 1000}s`
  );

  while (Date.now() < endTime) {
    attempts++;
    console.log(`   Lần ${attempts}: Đang kiểm tra Gmail...`);

    try {
      const found = await hasEmailFromSender(userEmail, startTime);
      if (found) {
        console.log(
          `✅ Tìm thấy email từ ${userEmail} sau ${attempts} lần kiểm tra!`
        );
        return true;
      }
    } catch (error) {
      console.error(`   ❌ Lỗi khi kiểm tra Gmail:`, error);
    }

    // Wait before next poll (but don't wait if we're about to timeout)
    const remainingTime = endTime - Date.now();
    if (remainingTime > pollIntervalMs) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    } else if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }
  }

  console.log(
    `❌ Không tìm thấy email từ ${userEmail} sau ${timeoutMs / 1000}s`
  );
  return false;
}

export default {
  hasEmailFromSender,
  waitForEmailFromUser,
};
