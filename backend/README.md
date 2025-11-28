# Hotel Booking Backend

Backend API cho hệ thống đặt phòng khách sạn sử dụng Node.js, Express, MongoDB và TypeScript.

## Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/          # Database & environment config
│   ├── models/          # MongoDB schemas
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API endpoints
│   ├── middlewares/     # Auth, error handling, validation
│   ├── utils/           # Helper functions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── package.json
└── tsconfig.json
```

## Cài đặt

1. Cài đặt dependencies:

```bash
cd backend
npm install
```

2. Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

3. Cập nhật các biến môi trường trong `.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hotel_booking
JWT_SECRET=your-secret-key
```

## Chạy ứng dụng

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API Endpoints

### Auth

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin user (requires auth)
- `PUT /api/auth/profile` - Cập nhật profile (requires auth)

### Rooms

- `GET /api/rooms` - Lấy danh sách phòng
- `GET /api/rooms/:id` - Lấy chi tiết phòng
- `GET /api/rooms/location/:location` - Lấy phòng theo địa điểm
- `POST /api/rooms` - Tạo phòng mới (admin only)
- `PUT /api/rooms/:id` - Cập nhật phòng (admin only)
- `DELETE /api/rooms/:id` - Xóa phòng (admin only)

### Bookings

- `POST /api/bookings` - Tạo booking mới
- `GET /api/bookings/:id` - Lấy chi tiết booking
- `GET /api/bookings` - Lấy tất cả bookings (admin only)
- `GET /api/bookings/user/my-bookings` - Lấy bookings của user (requires auth)
- `PATCH /api/bookings/:id/status` - Cập nhật trạng thái (admin only)
- `PATCH /api/bookings/:id/cancel` - Hủy booking (requires auth)

### Services

- `GET /api/services` - Lấy danh sách dịch vụ
- `GET /api/services/:id` - Lấy chi tiết dịch vụ
- `POST /api/services` - Tạo dịch vụ (admin only)
- `PUT /api/services/:id` - Cập nhật dịch vụ (admin only)
- `DELETE /api/services/:id` - Xóa dịch vụ (admin only)

### Policies

- `GET /api/policies` - Lấy danh sách chính sách
- `GET /api/policies/:slug` - Lấy chính sách theo slug
- `POST /api/policies` - Tạo chính sách (admin only)
- `PUT /api/policies/:id` - Cập nhật chính sách (admin only)
- `DELETE /api/policies/:id` - Xóa chính sách (admin only)

### Promotions

- `GET /api/promotions` - Lấy danh sách khuyến mãi
- `GET /api/promotions/:code` - Lấy khuyến mãi theo code
- `POST /api/promotions/validate` - Validate mã khuyến mãi
- `POST /api/promotions` - Tạo khuyến mãi (admin only)
- `PUT /api/promotions/:id` - Cập nhật khuyến mãi (admin only)
- `DELETE /api/promotions/:id` - Xóa khuyến mãi (admin only)

## Models

### User

- fullName, email, password, phone
- role: 'user' | 'admin'
- isVerified

### Room

- name, type, size, bedType, maxGuests
- description, amenities, images
- price, discountPrice
- availability, soldOut
- location, brand

### Booking

- user, room
- fullName, email, phone
- checkIn, checkOut, guests
- totalPrice
- status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
- paymentStatus: 'unpaid' | 'paid' | 'refunded'

### Service

- name, description, icon
- category: 'amenity' | 'facility' | 'activity'
- isAvailable

### Policy

- title, type, content, slug
- isActive

### Promotion

- title, description, code
- discountType: 'percentage' | 'fixed'
- discountValue, minBookingAmount, maxDiscount
- startDate, endDate
- usageLimit, usedCount
- applicableRooms

## Middleware

- **authMiddleware**: Xác thực JWT token
- **adminMiddleware**: Kiểm tra quyền admin
- **errorMiddleware**: Xử lý lỗi global
- **validateMiddleware**: Validate request data với Zod

## Utils

- **token.ts**: Tạo và verify JWT tokens
- **sendEmail.ts**: Gửi email xác nhận booking
- **responseFormatter.ts**: Format API responses

## Database

Dự án sử dụng MongoDB. Đảm bảo MongoDB đang chạy trước khi start server.

### Kết nối local MongoDB:

```bash
mongodb://localhost:27017/hotel_booking
```

### Hoặc sử dụng MongoDB Atlas (cloud):

Cập nhật `MONGODB_URI` trong `.env` với connection string của MongoDB Atlas.

## Deployment

### Heroku

1. Tạo Heroku app
2. Set environment variables
3. Deploy code

### Vercel/Railway

1. Import repository
2. Set environment variables
3. Deploy

## License

MIT
