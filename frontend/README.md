# Hotel Booking Frontend

Frontend cho hệ thống đặt phòng khách sạn sử dụng React, TypeScript, Vite và TailwindCSS.

## Cấu trúc thư mục

```
frontend/src/
├── assets/          # Images, icons, logos
├── components/      # Reusable components
├── pages/           # Page components
├── services/        # API service calls
├── context/         # React Context (state management)
├── utils/           # Helper functions
├── hooks/           # Custom React hooks
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── global.css       # Global styles
```

## Cài đặt

1. Cài đặt dependencies:

```bash
cd frontend
npm install
```

2. Tạo file `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

## Chạy ứng dụng

### Development

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Services

### API Service (`services/api.ts`)

Base API client với authentication support

### Room Service (`services/roomService.ts`)

- getAllRooms()
- getRoomsByLocation()
- getRoomById()
- createRoom() (admin)
- updateRoom() (admin)
- deleteRoom() (admin)

### Booking Service (`services/bookingService.ts`)

- createBooking()
- getAllBookings() (admin)
- getBookingById()
- getUserBookings()
- updateBookingStatus() (admin)
- cancelBooking()

### Auth Service (`services/authService.ts`)

- register()
- login()
- logout()
- getProfile()
- updateProfile()

## Context

### AuthContext

Quản lý authentication state:

- user
- loading
- login()
- register()
- logout()
- isAuthenticated

Sử dụng:

```tsx
import { useAuth } from "@/context/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  // ...
}
```

## Utils

### formatPrice.ts

- formatPrice(price): Format giá theo VNĐ
- formatPriceShort(price): Format giá ngắn gọn (1tr, 500k)

### dateHelper.ts

- formatDate(date): Format ngày đầy đủ
- formatDateShort(date): Format ngày ngắn
- calculateNights(checkIn, checkOut): Tính số đêm
- isDateInPast(date): Kiểm tra ngày đã qua

## Components

### Pages

- Home.tsx: Trang chủ
- Room_System.tsx: Danh sách phòng
- Service.tsx: Dịch vụ
- Food.tsx: Thực đơn
- Contact.tsx: Liên hệ
- Check_In_Policy.tsx: Chính sách nhận phòng
- Privacy_Policy.tsx: Chính sách bảo mật
- Refund_Policy.tsx: Chính sách hoàn tiền
- Member_Privilege.tsx: Quyền lợi thành viên
- Promotion.tsx: Khuyến mãi
- FAQ.tsx: Câu hỏi thường gặp
- NotFound.tsx: 404 page

### Components

- Header.tsx: Navigation bar
- Footer.tsx: Footer
- Room_Card.tsx: Card hiển thị phòng
- Banner_Search_Bar.tsx: Search bar trên banner
- Search_Bar.tsx: Search bar chung
- Carousel.tsx: Image carousel
- Login.tsx: Form đăng nhập
- Register.tsx: Form đăng ký
- Logo.tsx: Logo component
- Booking_Home.tsx: Booking form
- View_Home.tsx: Home view

## Styling

Dự án sử dụng TailwindCSS. Config trong `tailwind.config.ts`.

Themes và colors được định nghĩa trong `global.css`.

## Environment Variables

```
VITE_API_URL=http://localhost:5000/api
```

## Deployment

### Vercel

1. Import repository
2. Set environment variables
3. Deploy

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Set environment variables

## License

MIT
