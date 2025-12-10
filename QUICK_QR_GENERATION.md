# Quick QR Code Generation

## Overview

Added a simple POST endpoint for generating QR codes without requiring a Bill document. Perfect for quick testing or standalone payment QR generation.

## Endpoint

### POST /api/webhooks/create-qrcode

**Request:**

```json
{
  "amount": 200000,
  "memo": "Thanh toan don 123"
}
```

**Response (Success):**

```json
{
  "ok": true,
  "data": {
    "qr": "https://api.qrserver.com/v1/create-qr-code/?...",
    "amount": 200000,
    "accountNo": "1234567890",
    "accountName": "HOTEL BOOKING",
    "memo": "Thanh toan don 123"
  },
  "message": "QR code created"
}
```

**Response (Error):**

```json
{
  "ok": false,
  "message": "Invalid amount"
}
```

## Features

✅ No authentication required (public endpoint)
✅ Accepts any amount and memo
✅ Returns QR image URL (VietQR or fallback)
✅ Works with or without VietQR credentials
✅ Simple and lightweight

## Usage

### Frontend Component Example

```tsx
import { useEffect, useState } from "react";

export default function PaymentQR() {
  const [qr, setQr] = useState("");

  useEffect(() => {
    const loadQR = async () => {
      const res = await fetch("/api/webhooks/create-qrcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 200000,
          memo: "Thanh toan don 123",
        }),
      });

      const data = await res.json();
      setQr(data.data?.qr);
    };

    loadQR();
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h3>QR Thanh toán</h3>
      {qr ? (
        <img src={qr} width="260" alt="QR thanh toán" />
      ) : (
        <p>Đang tạo QR...</p>
      )}
    </div>
  );
}
```

### cURL Example

```bash
curl -X POST http://localhost:5000/api/webhooks/create-qrcode \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500000,
    "memo": "Test payment"
  }'
```

## Differences from Bill-based QR

| Feature       | createQRCode              | generateQRCode (Bill)  |
| ------------- | ------------------------- | ---------------------- |
| Auth Required | ❌ No                     | ✅ Yes                 |
| Requires Bill | ❌ No                     | ✅ Yes                 |
| Usage         | Quick testing, standalone | Payment confirmation   |
| Tracking      | ❌ No tracking            | ✅ Updates Bill status |
| Amount        | Any value                 | From Bill.finalAmount  |

## When to Use Each

**Use `createQRCode` (POST) for:**

- Testing QR generation
- Quick payments without booking
- Standalone payment requests
- Testing components
- Demo/development

**Use `generateQRCode` (GET) for:**

- Confirming bill payments
- Integrated booking payment flow
- Production payments
- Payment tracking and history

## Implementation Details

The endpoint:

1. Validates amount > 0
2. Gets bank account from config
3. Tries VietQR library if configured
4. Falls back to qrserver.com if needed
5. Returns QR image URL or Base64
6. Includes all payment details in response

## Security Notes

⚠️ This endpoint is public (no authentication). In production:

- Consider adding rate limiting
- Validate memo content
- Log all QR generations
- Consider authentication if needed
- Monitor for abuse
