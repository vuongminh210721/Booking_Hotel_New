# 🏨 HOTELHUB - Hướng Dẫn Khởi Động

## ✅ HỆ THỐNG ĐÃ SẴN SÀNG!

### 🚀 Chạy Web (Đơn giản nhất)

```powershell
pnpm dev
```

**Truy cập:** http://localhost:8080/

---

## 📁 Cấu Trúc Project

```
Hotel Booking/
├── frontend/              ⭐ React Frontend
│   ├── src/
│   │   ├── pages/        # Các trang: Index, Rooms, Services, Food, Locations, Contact
│   │   ├── components/   # Header, Footer, Logo, RoomCard, HeroCarousel
│   │   ├── services/     # API calls
│   │   ├── context/      # AuthContext
│   │   ├── App.tsx       # Main app với routes
│   │   └── main.tsx      # Entry point
│   └── index.html
│
├── backend/              # Node.js API (Optional)
│   ├── src/
│   │   ├── models/       # MongoDB schemas
│   │   ├── controllers/  # API handlers
│   │   ├── routes/       # API endpoints
│   │   └── middlewares/  # Auth, validation
│   └── .env
│
└── shared/               # Shared types
```

---

## 🌐 Routes Có Sẵn

| Route             | Mô Tả             |
| ----------------- | ----------------- |
| `/`               | 🏠 Trang chủ      |
| `/rooms`          | 🛏️ Hệ thống phòng |
| `/services`       | 🎯 Dịch vụ        |
| `/food`           | 🍽️ Ẩm thực        |
| `/locations`      | 📍 Địa điểm       |
| `/contact`        | 📞 Liên hệ        |
| `/privacy-policy` | 📜 Chính sách     |

---

## 🔧 Các Lệnh Hữu Ích

### Frontend

```powershell
pnpm dev          # Chạy dev server (port 8080)
pnpm build        # Build production
pnpm preview      # Preview production build
```

### Backend (Optional)

```powershell
cd backend
npm install
npm run dev       # Chạy API server (port 5000)
```

---

## ⚙️ Cấu Hình

### Frontend Environment (`.env`)

```
VITE_API_URL=http://localhost:5000/api
```

### Backend Environment (`backend/.env`)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hotel_booking
JWT_SECRET=your-secret-key
```

---

## 🐛 Troubleshooting

### Lỗi "vite command not found"

```powershell
pnpm install
```

### Port 8080 đã được sử dụng

Sửa trong `vite.config.ts`:

```typescript
server: {
  port: 3000; // Đổi sang port khác
}
```

### Làm mới cache

```powershell
Remove-Item node_modules -Recurse -Force
Remove-Item .pnpm-store -Recurse -Force
pnpm install
```

---

## 📦 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **UI Library**: Radix UI + Lucide Icons
- **Routing**: React Router 6
- **State**: React Context + TanStack Query
- **Backend**: Express + MongoDB + Mongoose
- **Auth**: JWT + bcrypt

---

## 🎨 Thư Viện UI Components

Có sẵn 60+ components trong `frontend/src/components/ui/`:

- Button, Card, Dialog, Form, Input
- Select, Tabs, Table, Toast, Tooltip
- Calendar, Carousel, Chart, v.v.

**Import:**

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

---

## 📝 Ghi Chú

- ✅ Hot reload tự động khi sửa code
- ✅ TypeScript cho type safety
- ✅ TailwindCSS cho styling nhanh
- ✅ React Router cho SPA routing
- ✅ API đã chuẩn bị sẵn (MongoDB models + controllers)

**Chúc bạn code vui vẻ! 🚀**
