# Email Payment Verification - Hướng dẫn cấu hình

## Tổng quan

Hệ thống xác nhận thanh toán qua email:

1. User quét QR → chuyển tiền
2. User gửi email thủ công đến **HotelHub2202@gmail.com**
3. Backend định kỳ đọc Gmail → nếu có email mới trong 1 phút → `success = true`
4. Frontend nhận kết quả và hiển thị trạng thái

## API Endpoint

### POST `/api/payments/email-check`

**Request body** (optional):

```json
{
  "timeoutMs": 60000, // Thời gian chờ (mặc định: 60 giây)
  "intervalMs": 5000 // Khoảng thời gian poll (mặc định: 5 giây)
}
```

**Response**:

```json
{
  "success": true // true nếu có email mới, false nếu hết timeout
}
```

**Lưu ý**: API này **blocking** - sẽ chờ tối đa 60 giây trước khi trả về kết quả.

## Cấu hình Gmail API

### Bước 1: Tạo project trên Google Cloud Console

1. Truy cập: https://console.cloud.google.com/
2. Tạo project mới: "Hotel Booking Email Verification"
3. Bật Gmail API:
   - Vào **APIs & Services** → **Library**
   - Tìm "Gmail API" → Click **Enable**

### Bước 2: Tạo OAuth 2.0 Credentials

1. Vào **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Chọn **Desktop app** (hoặc Web application)
4. Đặt tên: "Hotel Email Checker"
5. Tải file JSON về (hoặc copy Client ID + Client Secret)

### Bước 3: Lấy Refresh Token

#### Cách 1: Dùng script có sẵn

```bash
cd backend
npx tsx scripts/getGmailToken.ts
```

Làm theo hướng dẫn trong console:

1. Mở URL trong trình duyệt
2. Đăng nhập với tài khoản **HotelHub2202@gmail.com**
3. Chấp nhận quyền truy cập
4. Copy authorization code từ URL
5. Paste vào terminal
6. Lưu refresh_token vào `.env`

#### Cách 2: Dùng OAuth Playground

1. Truy cập: https://developers.google.com/oauthplayground
2. Click cài đặt (góc phải) → nhập Client ID + Secret
3. Chọn scope: `https://www.googleapis.com/auth/gmail.readonly`
4. Click **Authorize APIs**
5. Đăng nhập Gmail HotelHub2202@gmail.com
6. Click **Exchange authorization code for tokens**
7. Copy **Refresh token**

### Bước 4: Cập nhật file .env

```env
GMAIL_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
GMAIL_REFRESH_TOKEN=1//0xxxxxxxxxxxxxxxxxxxxxx
GMAIL_EMAIL=HotelHub2202@gmail.com
```

## Test API

### Dùng curl:

```bash
# Start request (sẽ block trong 60 giây hoặc đến khi có email)
curl -X POST http://localhost:5000/api/payments/email-check \
  -H "Content-Type: application/json" \
  -d '{"timeoutMs": 60000}'
```

**Trong khi API đang chờ**, gửi email bất kỳ đến HotelHub2202@gmail.com:

- Từ: email cá nhân của bạn
- Tiêu đề: bất kỳ (ví dụ: "Test payment")
- Nội dung: bất kỳ

→ API sẽ trả về `{"success": true}` ngay lập tức

### Dùng Postman:

1. Method: POST
2. URL: `http://localhost:5000/api/payments/email-check`
3. Body (raw JSON):

```json
{
  "timeoutMs": 60000,
  "intervalMs": 5000
}
```

4. Gửi request → trong khi chờ, gửi email test
5. Quan sát response

## Cách hoạt động

1. **Frontend gọi API** sau khi user báo "đã chuyển tiền"
2. **Backend bắt đầu polling** Gmail API mỗi 5 giây:
   - Query: `after:<timestamp>` (timestamp = thời điểm bắt đầu check)
   - Nếu có ≥1 email mới → return `success: true`
3. **Timeout sau 60 giây**: nếu không có email → return `success: false`
4. **Frontend hiển thị** kết quả cho user

## Lưu ý quan trọng

### Bảo mật

- ⚠️ **KHÔNG commit** refresh_token vào Git
- Đảm bảo file `.env` trong `.gitignore`
- Giới hạn scope OAuth chỉ `gmail.readonly`

### Performance

- API **blocking**: frontend nên hiển thị loading indicator
- Có thể giảm `intervalMs` xuống 3000ms (3s) để phản hồi nhanh hơn
- Gmail API có rate limit: 250 quota units/user/second

### Production

- Nên dùng WebSocket/SSE thay vì blocking HTTP request
- Xem xét push notification qua Gmail Pub/Sub
- Validate email sender (whitelist domain hoặc yêu cầu user cung cấp email)
- Lưu trạng thái vào database để tránh check trùng lặp

## Troubleshooting

### "Invalid grant" error

- Refresh token hết hạn → tạo mới bằng script
- Scope không khớp → đảm bảo dùng `gmail.readonly`

### "Insufficient permissions"

- Kiểm tra OAuth consent screen đã publish
- Xác nhận tài khoản Gmail đã authorize

### Không tìm thấy email

- Kiểm tra timezone: `after:` query dùng UTC epoch seconds
- Email có thể bị delay vài giây do Gmail sync

### API trả về success=false luôn

- Kiểm tra `.env` có đủ 4 biến Gmail
- Test bằng cách gửi email trước, sau đó gọi API với timeout dài (120s)

## Mở rộng tương lai

- [ ] Lưu trạng thái check vào MongoDB (avoid duplicate)
- [ ] WebSocket realtime notification thay vì blocking
- [ ] Parse email body để extract booking ID
- [ ] Gmail push notification qua Pub/Sub
- [ ] Multi-tenant: nhiều email system khác nhau
