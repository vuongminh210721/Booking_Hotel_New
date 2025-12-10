# 🔌 HotelHub API Documentation

## Cấu trúc API

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT Bearer Token (header: `Authorization: Bearer <token>`)
- **Content-Type**: `application/json`

---

## 🏨 Phòng (Rooms)

### GET /api/rooms

Lấy danh sách tất cả phòng.

**Query Parameters:**

- `location` - Lọc theo địa điểm (optional)
- `type` - Loại phòng (optional)
- `minPrice` - Giá tối thiểu (optional)
- `maxPrice` - Giá tối đa (optional)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "room_123",
      "name": "Phòng Deluxe",
      "description": "...",
      "location": "Tp Hồ Chí Minh",
      "type": "deluxe",
      "price": 500000,
      "capacity": 2,
      "amenities": ["WiFi", "AC", "TV", ...],
      "images": ["url1", "url2", ...],
      "rating": 4.5,
      "reviews": 120
    }
  ]
}
```

### GET /api/rooms/:id

Lấy chi tiết một phòng.

**Response:**

```json
{
  "success": true,
  "data": {
    /* room object */
  }
}
```

---

## 🛏️ Đặt phòng (Bookings)

### POST /api/bookings

Tạo đặt phòng mới.

**Headers:**

```
Authorization: Bearer <token>
```

**Body:**

```json
{
  "roomId": "room_123",
  "checkInDate": "2025-12-15",
  "checkOutDate": "2025-12-17",
  "guests": 2,
  "totalPrice": 1000000,
  "paymentMethod": "deposit"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "booking_123",
    "userId": "user_123",
    "roomId": "room_123",
    "checkInDate": "2025-12-15",
    "checkOutDate": "2025-12-17",
    "status": "pending",
    "totalPrice": 1000000,
    "paymentMethod": "deposit",
    "createdAt": "2025-12-04T..."
  }
}
```

### GET /api/bookings

Lấy lịch sử đặt phòng của người dùng.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    /* array of bookings */
  ]
}
```

---

## 👤 Xác thực (Auth)

### POST /api/auth/register

Đăng ký tài khoản mới.

**Body:**

```json
{
  "fullName": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0912345678",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_123",
      "fullName": "Nguyễn Văn A",
      "email": "user@example.com",
      "phone": "0912345678",
      "customerType": "thường"
    },
    "token": "eyJhbGc..."
  }
}
```

### POST /api/auth/login

Đăng nhập.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** (tương tự register)

### GET /api/auth/profile

Lấy thông tin người dùng hiện tại.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    /* user object */
  }
}
```

### PUT /api/auth/profile

Cập nhật thông tin người dùng.

**Headers:**

```
Authorization: Bearer <token>
```

**Body:**

```json
{
  "fullName": "Nguyễn Văn B",
  "phone": "0987654321",
  "address": "123 Đường ABC, TPHCM"
}
```

---

## 🛎️ Dịch vụ (Services)

### GET /api/services

Lấy danh sách dịch vụ.

**Query Parameters:**

- `category` - Danh mục (spa_wellness, food_beverage, ...)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "service_123",
      "name": "Massage Thư Giãn",
      "description": "...",
      "category": "spa_wellness",
      "price": 500000,
      "duration": "60 phút",
      "image": "url"
    }
  ]
}
```

---

## ⭐ Đánh giá (Reviews)

### GET /api/reviews

Lấy danh sách đánh giá.

**Query Parameters:**

- `roomId` - Lọc theo phòng (optional)
- `userId` - Lọc theo người dùng (optional)

### POST /api/reviews

Tạo đánh giá mới.

**Headers:**

```
Authorization: Bearer <token>
```

**Body:**

```json
{
  "roomId": "room_123",
  "bookingId": "booking_123",
  "rating": 5,
  "comment": "Phòng sạch sẽ, nhân viên thân thiện!"
}
```

---

## 💰 Ưu đãi (Promotions)

### GET /api/promotions

Lấy danh sách ưu đãi.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "promo_123",
      "title": "Khách hàng mới - Giảm 25%",
      "discount": 25,
      "validFrom": "2025-01-01",
      "validTo": "2025-12-31",
      "code": "NEW25"
    }
  ]
}
```

---

## ⚠️ Lỗi (Error Responses)

### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid request data"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Token expired or invalid"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🧪 Test Endpoints

```bash
# Ping
curl http://localhost:5000/api/ping

# Rooms
curl http://localhost:5000/api/rooms

# Health
curl http://localhost:5000/api/health
```

---

**Generated**: 2025-12-04
