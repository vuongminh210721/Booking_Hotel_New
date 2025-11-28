# HotelHub API Documentation

## 📊 Database Models

### ✅ Đã có từ trước

- **User** - Người dùng
- **Room** - Phòng khách sạn
- **Booking** - Đặt phòng
- **Service** - Dịch vụ (đã cập nhật)
- **Promotion** - Khuyến mãi
- **Policy** - Chính sách

### ✨ Models mới được bổ sung

- **Review** - Đánh giá khách hàng
- **MenuItem** - Món ăn/Thực đơn
- **Location** - Địa điểm chi nhánh
- **ServiceBooking** - Đặt dịch vụ
- **Payment** - Thanh toán
- **RoomAvailability** - Tình trạng phòng theo ngày
- **FoodOrder** - Đơn đặt món ăn

---

## 🔌 API Endpoints

### 🔐 Authentication (`/api/auth`)

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin profile (auth required)
- `PUT /api/auth/profile` - Cập nhật profile (auth required)
- `POST /api/auth/upload-avatar` - Upload ảnh đại diện (auth required)

### 🛏️ Rooms (`/api/rooms`)

- `GET /api/rooms` - Lấy danh sách phòng
- `GET /api/rooms/:id` - Lấy chi tiết phòng
- `POST /api/rooms` - Tạo phòng mới (admin)
- `PUT /api/rooms/:id` - Cập nhật phòng (admin)
- `DELETE /api/rooms/:id` - Xóa phòng (admin)

### 📅 Bookings (`/api/bookings`)

- `GET /api/bookings` - Lấy danh sách đặt phòng
- `GET /api/bookings/:id` - Lấy chi tiết đặt phòng
- `POST /api/bookings` - Tạo đặt phòng mới
- `PUT /api/bookings/:id` - Cập nhật đặt phòng
- `DELETE /api/bookings/:id` - Hủy đặt phòng

### 📝 Reviews (`/api/reviews`) ✨ MỚI

- `GET /api/reviews` - Lấy tất cả đánh giá
  - Query: `?room=roomId&rating=5&limit=20&page=1`
- `GET /api/reviews/:id` - Lấy đánh giá theo ID
- `GET /api/reviews/room/:roomId` - Lấy đánh giá của phòng
- `GET /api/reviews/my-reviews` - Lấy đánh giá của user (auth required)
- `POST /api/reviews` - Tạo đánh giá (auth required)
- `PUT /api/reviews/:id` - Cập nhật đánh giá (auth required, owner only)
- `DELETE /api/reviews/:id` - Xóa đánh giá (auth required, owner only)
- `POST /api/reviews/:id/helpful` - Đánh dấu hữu ích

### 🍽️ Menu Items (`/api/menu-items`) ✨ MỚI

- `GET /api/menu-items` - Lấy tất cả món ăn
  - Query: `?category=Món Châu Á&isAvailable=true&search=phở`
- `GET /api/menu-items/:id` - Lấy chi tiết món ăn
- `GET /api/menu-items/categories` - Lấy danh sách category
- `GET /api/menu-items/popular` - Lấy món ăn phổ biến
- `GET /api/menu-items/category/:category` - Lấy món theo category
- `POST /api/menu-items` - Tạo món mới (admin)
- `PUT /api/menu-items/:id` - Cập nhật món (admin)
- `DELETE /api/menu-items/:id` - Xóa món (admin)

**Categories:**

- Món Châu Á
- Món Châu Âu
- Món Nhật Bản
- Thức Uống Pha Chế
- Tráng Miệng
- Ăn Sáng

### 📍 Locations (`/api/locations`) ✨ MỚI

- `GET /api/locations` - Lấy tất cả địa điểm
  - Query: `?city=Hà Nội&isActive=true`
- `GET /api/locations/:id` - Lấy chi tiết địa điểm
- `GET /api/locations/cities` - Lấy danh sách thành phố
- `GET /api/locations/city/:city` - Lấy địa điểm theo thành phố
- `POST /api/locations` - Tạo địa điểm mới (admin)
- `PUT /api/locations/:id` - Cập nhật địa điểm (admin)
- `DELETE /api/locations/:id` - Xóa địa điểm (admin)

### 🛎️ Services (`/api/services`)

- `GET /api/services` - Lấy tất cả dịch vụ
  - Query: `?category=spa_wellness&isAvailable=true`
- `GET /api/services/:id` - Lấy chi tiết dịch vụ
- `POST /api/services` - Tạo dịch vụ mới (admin)
- `PUT /api/services/:id` - Cập nhật dịch vụ (admin)
- `DELETE /api/services/:id` - Xóa dịch vụ (admin)

**Service Categories:**

- hotel_service (Dịch vụ khách sạn)
- spa_wellness (Spa & Chăm sóc sức khỏe)
- food_beverage (Ăn uống)
- transportation (Vận chuyển)
- activities (Hoạt động & Du lịch)

### 🎁 Promotions (`/api/promotions`)

- `GET /api/promotions` - Lấy tất cả khuyến mãi
- `GET /api/promotions/:id` - Lấy chi tiết khuyến mãi
- `POST /api/promotions` - Tạo khuyến mãi (admin)
- `PUT /api/promotions/:id` - Cập nhật khuyến mãi (admin)
- `DELETE /api/promotions/:id` - Xóa khuyến mãi (admin)

### 📜 Policies (`/api/policies`)

- `GET /api/policies` - Lấy tất cả chính sách
- `GET /api/policies/:id` - Lấy chi tiết chính sách
- `POST /api/policies` - Tạo chính sách (admin)
- `PUT /api/policies/:id` - Cập nhật chính sách (admin)
- `DELETE /api/policies/:id` - Xóa chính sách (admin)

---

## 🚀 Cách sử dụng

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` trong thư mục `backend`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hotelhub
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:8080
```

### 3. Seed database

```bash
npm run seed
```

### 4. Chạy server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

---

## 📝 Sample Data đã seed

### Reviews (3)

- Đánh giá cho HotelHub Resort Phú Quốc (5 sao)
- Đánh giá cho HotelHub Resort Đà Nẵng (5 sao)
- Đánh giá cho HotelHub Kim Mã Hà Nội (4 sao)

### Menu Items (7)

- Phở Bò Đặc Biệt
- Cơm Sườn Nướng
- Steak Ribeye
- Pasta Carbonara
- Sushi Set Deluxe
- Mojito Classic
- Tiramisu

### Locations (3)

- HotelHub Kim Mã (Hà Nội)
- HotelHub Vincom Landmark 81 (TP Hồ Chí Minh)
- HotelHub Mỹ Khê Beach (Đà Nẵng)

### Services (5)

- Giặt ủi
- Đưa đón sân bay
- Spa & Trị liệu
- Hồ bơi vô cực
- Hướng dẫn viên du lịch

### User demo

- Email: `demo@hotelhub.vn`
- Password: `Demo123!`

---

## 🔨 Models còn lại cần implement controllers

Các models sau đã được tạo nhưng chưa có controllers/routes:

1. **ServiceBooking** - Đặt dịch vụ
2. **Payment** - Thanh toán
3. **RoomAvailability** - Tình trạng phòng
4. **FoodOrder** - Đơn đặt món

Bạn có thể implement controllers cho các models này theo pattern tương tự như các controllers đã có.

---

## 📱 Áp dụng cho Frontend

### Các trang cần update để dùng API:

1. **Home.tsx**
   - GET `/api/reviews` - Hiển thị đánh giá khách hàng
   - GET `/api/rooms` - Danh sách phòng

2. **Service.tsx**
   - GET `/api/services` - Lấy danh sách dịch vụ

3. **Food.tsx**
   - GET `/api/menu-items` - Lấy thực đơn
   - GET `/api/menu-items/categories` - Lấy categories

4. **Locations.tsx**
   - GET `/api/locations` - Lấy địa điểm

5. **Reviews.tsx** (mới)
   - GET `/api/reviews` - Xem đánh giá
   - POST `/api/reviews` - Tạo đánh giá mới

---

## 🎯 Next Steps

1. ✅ Models đã tạo xong
2. ✅ Controllers & Routes cho Review, MenuItem, Location
3. ✅ Database đã seed
4. ⏳ Tạo controllers cho ServiceBooking, Payment, FoodOrder, RoomAvailability
5. ⏳ Update frontend để sử dụng API thay vì mock data
6. ⏳ Implement admin dashboard để quản lý data

---

## 📞 Support

Nếu có câu hỏi hoặc gặp lỗi, vui lòng tạo issue hoặc liên hệ team dev.
