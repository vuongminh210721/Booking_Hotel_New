# Quick Implementation Guide

## What Was Added

### 1. New Backend Endpoint: `POST /api/webhooks/create-qrcode`

**Location:** `backend/src/controllers/webhookController.ts`

- New function: `createQRCode()`
- Accepts: `{ amount: number, memo: string }`
- Returns: `{ qr: string, amount, accountNo, accountName, memo }`
- No authentication required
- Public endpoint for quick QR generation

**Route:** `backend/src/routes/webhookRoutes.ts`

- Added: `router.post("/create-qrcode", noCacheMiddleware, createQRCode)`

### 2. New Frontend Component: `PaymentQR.tsx`

**Location:** `frontend/src/components/PaymentQR.tsx`

- React component that demonstrates QR generation
- Fetches from `/api/webhooks/create-qrcode`
- Shows loading state
- Error handling
- Displays QR image with fallback text

## How to Test

### Option 1: Direct cURL Test

```bash
curl -X POST http://localhost:5000/api/webhooks/create-qrcode \
  -H "Content-Type: application/json" \
  -d '{"amount": 200000, "memo": "Test payment"}'
```

Expected response:

```json
{
  "ok": true,
  "data": {
    "qr": "https://api.qrserver.com/v1/...",
    "amount": 200000,
    "accountNo": "1234567890",
    "accountName": "HOTEL BOOKING",
    "memo": "Test payment"
  }
}
```

### Option 2: Component Test

1. Import `PaymentQR` into a page:

```tsx
import PaymentQR from "@/components/PaymentQR";

export default function TestPage() {
  return <PaymentQR />;
}
```

2. Visit the page - QR should display

### Option 3: Browser DevTools

```javascript
fetch("/api/webhooks/create-qrcode", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ amount: 300000, memo: "Test" }),
})
  .then((r) => r.json())
  .then(console.log);
```

## Files Modified/Created

✅ **Created:**

- `frontend/src/components/PaymentQR.tsx` - New component
- `QUICK_QR_GENERATION.md` - Documentation
- `QUICK_IMPLEMENTATION_GUIDE.md` - This file

✅ **Modified:**

- `backend/src/controllers/webhookController.ts` - Added `createQRCode()` function
- `backend/src/routes/webhookRoutes.ts` - Added POST route for `/create-qrcode`

## Integration with Your Code

If you want to use the QR generation in existing components:

### In Floating_Bill.tsx

```tsx
// For simple testing without Bill context:
const fetchSimpleQR = async (amount: number, memo: string) => {
  const res = await fetch("/api/webhooks/create-qrcode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, memo }),
  });
  const data = await res.json();
  return data.data?.qr;
};
```

### In Any Component

```tsx
const [qrUrl, setQrUrl] = useState("");

const generateQR = async (amount: number, description: string) => {
  const response = await fetch("/api/webhooks/create-qrcode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      memo: description,
    }),
  });
  const data = await response.json();
  setQrUrl(data.data?.qr);
};
```

## Key Differences

| Aspect                 | Old (Bill-based)         | New (Simple QR)              |
| ---------------------- | ------------------------ | ---------------------------- |
| Endpoint               | GET /webhooks/qr/:billId | POST /webhooks/create-qrcode |
| Auth Required          | Yes ✅                   | No ❌                        |
| Requires Bill Document | Yes                      | No                           |
| Use Case               | Payment confirmation     | Quick testing                |
| Tracking               | Yes (updates Bill)       | No (stateless)               |

## Next Steps

1. ✅ Code is implemented and error-free
2. Start backend: `npm run dev` in `backend/` folder
3. Start frontend: `npm run dev` in `frontend/` folder
4. Test the QR generation using any method above
5. Customize the `PaymentQR` component for your UI needs

## API Response Details

### Response Structure

```json
{
  "ok": true,
  "data": {
    "qr": "string (URL or Base64)",
    "amount": "number (rounded to VND)",
    "accountNo": "string (from config)",
    "accountName": "string (from config)",
    "memo": "string (payment reference)"
  },
  "message": "QR code created"
}
```

### Error Response

```json
{
  "ok": false,
  "message": "Error description",
  "statusCode": 400 | 500
}
```

## Notes

- Amount should be in VND (smallest unit)
- Memo/description is used as payment reference
- QR image URL is fully formed (can be used directly in `<img src={url} />`)
- Supports both VietQR and online QR generation fallback
- No database interaction (stateless)
- Safe for public/unauthenticated use
