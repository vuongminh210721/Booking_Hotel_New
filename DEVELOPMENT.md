# Hotel Booking - Development Guide

## Cấu trúc Project

```
hotel-booking/
├── frontend/           # React Frontend
│   ├── src/
│   ├── public/
│   ├── index.html
│   └── package.json
│
├── backend/            # Node.js Backend
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
├── server/             # Express server (legacy - có thể xóa)
├── shared/             # Shared types
└── package.json        # Root package
```

## Chạy ứng dụng

### 1. Chạy Frontend (Vite Dev Server)

```powershell
# Từ thư mục root
pnpm install
pnpm dev
```

Frontend sẽ chạy tại: `http://localhost:8080`

### 2. Chạy Backend (Node.js API) - Optional

```powershell
# Terminal mới
cd backend
npm install

# Tạo .env file
cp .env.example .env

# Cập nhật MongoDB URI trong .env
# MONGODB_URI=mongodb://localhost:27017/hotel_booking

# Chạy backend
npm run dev
```

Backend sẽ chạy tại: `http://localhost:5000`

## Cấu trúc Frontend

```
frontend/src/
├── components/
│   ├── ui/              # Radix UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ...
├── pages/               # Route pages
├── services/            # API calls
├── context/             # React Context
├── utils/               # Helpers
├── hooks/               # Custom hooks
├── lib/                 # Utils
├── App.tsx
├── main.tsx
└── global.css
```

## Scripts

### Frontend

```powershell
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
```

### Backend

```powershell
npm run dev       # Start with hot reload
npm run build     # Build TypeScript
npm start         # Run production
```

## Troubleshooting

### Frontend không chạy được

```powershell
# Xóa node_modules và cài lại
Remove-Item node_modules -Recurse -Force
pnpm install
```

### Lỗi TypeScript

```powershell
pnpm typecheck
```

### Port 8080 đã được sử dụng

Sửa port trong `vite.config.ts`:

```typescript
server: {
  port: 3000; // Đổi sang port khác
}
```

## Environment Variables

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hotel_booking
JWT_SECRET=your-secret-key
```

## Deployment

### Frontend (Vercel/Netlify)

```powershell
cd frontend
pnpm build
# Upload thư mục dist/
```

### Backend (Railway/Render)

```powershell
cd backend
npm run build
# Deploy thư mục dist/
```
