# 🏨 HotelHub - Hệ thống đặt phòng khách sạn

Ứng dụng web đặt phòng khách sạn hiện đại với React + Node.js + MongoDB.

## 🚀 Khởi động nhanh

### Yêu cầu

- Node.js 18+
- MongoDB (local hoặc cloud)
- npm/yarn/pnpm

### Cài đặt & Chạy

#### 1. Frontend (Vite + React)

```bash
cd frontend
npm install
npm run dev
# http://localhost:8080
```

#### 2. Backend (Express + TypeScript)

```bash
cd backend
npm install
# Tạo/cập nhật .env
npm run dev
# http://localhost:5000
```

## 📁 Cấu trúc thư mục

```
HotelHub/
├── frontend/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── pages/               # Trang (Home, Rooms, Booking, ...)
│   │   ├── components/          # Component tái sử dụng
│   │   ├── services/            # API calls (authService, ...)
│   │   ├── context/             # State management (AuthContext)
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # Utils, constants
│   │   ├── App.tsx              # Main router
│   │   └── main.tsx             # Entry point
│   ├── vite.config.ts           # Vite config (port 8080, proxy /api → 5000)
│   ├── tailwind.config.ts       # Tailwind CSS
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                      # Node.js Backend (Express)
│   ├── src/
│   │   ├── routes/              # API routes (rooms, bookings, auth, ...)
│   │   ├── controllers/         # Business logic
│   │   ├── models/              # Mongoose schemas
│   │   ├── middlewares/         # Auth, error handling, ...
│   │   ├── services/            # Database operations
│   │   ├── utils/               # Helpers
│   │   ├── config/
│   │   │   ├── env.ts           # Environment variables
│   │   │   └── db.ts            # MongoDB connection
│   │   ├── app.ts               # Express setup (CORS, routes)
│   │   └── server.ts            # Start server
│   ├── .env                     # Backend env (PORT, MONGODB_URI, JWT, ...)
│   ├── tsconfig.json
│   └── package.json
│
├── docs/                         # Documentation
│   ├── API.md                   # API endpoints reference
│   ├── DATABASE.md              # DB schema, models
│   ├── DEPLOYMENT.md            # Deploy guides
│   └── FEATURES.md              # Feature list
│
├── .env.example                 # Template (không commit .env thật)
├── README.md                    # This file
└── .gitignore
```

## 🔧 Environment Variables

### Frontend (.env hoặc vite.config.ts)

```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/hotel_booking
# Hoặc MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/hotel_booking

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d

# Frontend CORS
FRONTEND_URL=http://localhost:8080
```

## 🎯 Các tính năng chính

- ✅ Xem danh sách phòng theo thành phố
- ✅ Tìm kiếm & lọc phòng (giá, ngày, loại phòng)
- ✅ Đặt phòng (booking) với xác nhận
- ✅ Đăng ký / Đăng nhập tài khoản
- ✅ Quản lý hồ sơ người dùng
- ✅ Lịch sử đặt phòng & đánh giá
- ✅ Hệ thống điểm thưởng & ưu đãi
- ✅ Dịch vụ thêm (Spa, ẩm thực, ...)
- ✅ Chính sách & FAQ

## 🔌 API Endpoints

### Phòng (Rooms)

- `GET /api/rooms` - Danh sách phòng
- `GET /api/rooms/:id` - Chi tiết phòng

### Đặt phòng (Bookings)

- `POST /api/bookings` - Tạo đặt phòng
- `GET /api/bookings` - Lịch sử đặt phòng

### Xác thực (Auth)

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Thông tin người dùng

### Dịch vụ & Chính sách

- `GET /api/services` - Danh sách dịch vụ
- `GET /api/policies` - Chính sách
- `GET /api/promotions` - Ưu đãi

## 🧪 Chạy test

```bash
# Frontend
cd frontend
npm run typecheck

# Backend
cd backend
npm run typecheck
```

## 📝 Notes

- Frontend proxy `/api` → Backend (xem `vite.config.ts`)
- JWT tokens lưu trong localStorage
- Avatar uploads trong `/backend/uploads/avatars`
- MongoDB sử dụng Mongoose

## 🚀 Deploy

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build
# Upload dist/
```

### Backend (Railway/Render)

```bash
cd backend
npm run build
# Deploy dist/ folder
```

## 📞 Hỗ trợ

Xem tài liệu chi tiết trong thư mục `docs/`.

---

**Happy Booking! 🏨✨**
