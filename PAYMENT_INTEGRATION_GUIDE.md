# Hotel Booking - Payment Integration Guide

## Overview

This document describes the complete payment system with dynamic QR code generation, real-time status updates, and countdown timer functionality.

## System Architecture

### Backend Components

#### 1. **Payment Model (Bill.ts)**

Added fields to track payment:

- `paymentAmountReceived`: Amount received from customer
- `paymentReference`: Transaction ID from bank/MoMo
- `paymentConfirmedAt`: Timestamp when payment was confirmed
- `paymentConfirmedBy`: User ID who confirmed the payment (for manual confirmation)

#### 2. **Webhook Controller (webhookController.ts)**

Three main endpoints:

**POST /api/webhooks/payment** - Receive bank/MoMo webhook

- Accepts payment notification from bank
- Validates bill reference and amount
- Updates bill status (paid/partial)
- Emits Socket.IO event to notify user

**GET /api/webhooks/qr/:billId** - Generate QR code image

- Requires authentication
- Returns:
  - `qrDataURL`: Base64 or URL for QR image (from VietQR or fallback)
  - `amount`: Transfer amount
  - `accountNo`: Bank account number
  - `accountName`: Account holder name
  - `memo`: Payment reference (Bill number)
  - `qrText`: Raw QR data for manual entry fallback

**GET /api/webhooks/verify/:billId** - Admin payment verification

- Requires admin authentication
- Returns current payment status and amounts

#### 3. **Bill Controller Updates**

- **getBillStatus**: Check payment progress (used by polling)
- **userConfirmPayment**: User manually confirms payment when transfer is done
  - Updates Bill status to "paid"
  - Updates related Booking/Room availability
  - Emits Socket.IO event

### Frontend Components

#### 1. **Payment Tab Flow**

```
User clicks "Thanh toán" tab
  ↓
QR Code fetches from /webhooks/qr/:billId
  ↓
Poll /bills/:id/status every 3 seconds
  ↓
Countdown timer: 5:00 → 0:00
  ↓
Payment detected OR timeout
  ↓
Show success/error message
```

#### 2. **Polling Mechanism**

- Fetches bill status every 3 seconds
- Checks all bills in current group
- Success criteria: `paymentStatus === "paid"` for all bills
- On success: Auto-remove paid bills, show success message, close modal

#### 3. **Countdown Timer**

- Starts at 300 seconds (5 minutes)
- Displays in MM:SS format
- Red highlight when ≤60 seconds
- At 0: Stop polling, show timeout error "Hết thời gian thanh toán"

#### 4. **Room Card Reactivity**

- Listens for `roomUpdated` event
- Re-fetches room data from API
- Updates local availability and price

### QR Code Generation

#### VietQR Integration (Primary)

If credentials provided in `.env`:

```env
VIET_QR_CLIENT_ID=your_client_id
VIET_QR_API_KEY=your_api_key
VIET_QR_ACCOUNT=1234567890
VIET_QR_NAME=HOTEL BOOKING
BANK_CODE=970407  # Vietcombank
```

The system will use the VietQR library to generate actual QR codes with:

- Real bank account information
- Exact transfer amount
- Transaction reference (Bill number)
- QR image as Base64 or URL

#### Fallback QR Generation

If VietQR not configured or fails:

- Uses qrserver.com API
- Generates standard QR code with VIETQR format payload
- Returns URL instead of Base64

## Payment Flow Examples

### Scenario 1: User Transfers Correct Amount (Happy Path)

```
1. User clicks "Thanh toán" tab
2. QR code displays with countdown
3. User scans QR and transfers money
4. Bank sends webhook to POST /webhooks/payment
5. Bill status updates to "paid"
6. Frontend polling detects status change
7. UI shows "✅ Thanh toán thành công"
8. Bill auto-removed from modal
9. Room card updates availability
```

### Scenario 2: User Confirms Manually

```
1. User clicks "Thanh toán" tab
2. User transfers money (without webhook setup in test)
3. User clicks "Đã thanh toán" button
4. POST /bills/:id/confirm-by-user called
5. Backend marks Bill as "paid"
6. Frontend polling detects change
7. Same success flow as Scenario 1
```

### Scenario 3: Timeout

```
1. User clicks "Thanh toán" tab
2. QR displays with 5:00 countdown
3. User doesn't transfer (or network issue)
4. Timer counts down to 0:00
5. Polling stops
6. UI shows "❌ Hết thời gian thanh toán"
7. User must try again
```

### Scenario 4: Partial Payment

```
1. Bank webhook received with amount < expected
2. Bill status updated to "partial"
3. Frontend polling sees paymentStatus === "partial"
4. UI shows "⚠️ Số tiền không đủ"
5. Countdown continues
6. User can transfer remaining amount
```

## Environment Setup

### Backend .env

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hotel-booking

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:5173

# VietQR (optional but recommended)
VIET_QR_CLIENT_ID=your_client_id
VIET_QR_API_KEY=your_api_key
VIET_QR_ACCOUNT=1234567890
VIET_QR_NAME=HOTEL BOOKING
BANK_CODE=970407

# Webhook (production only)
WEBHOOK_SECRET=your-webhook-secret
```

### Frontend .env

```env
VITE_API_URL=http://localhost:5000/api
```

## Testing

### 1. Manual Testing (Without Real Bank Integration)

```
1. Create a booking (bill will be generated)
2. Click bill → Payment tab
3. QR should display with countdown
4. Click "Đã thanh toán" button to simulate payment
5. Check console for polling logs
6. Verify success message appears
```

### 2. Webhook Testing with cURL

```bash
curl -X POST http://localhost:5000/api/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "bill-id-or-bill-number",
    "amount": 5000000,
    "transactionId": "tx-test-123",
    "bankCode": "970407"
  }'
```

### 3. QR Generation Testing

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/webhooks/qr/bill-id
```

Should return:

```json
{
  "ok": true,
  "data": {
    "billId": "...",
    "amount": 5000000,
    "accountNo": "1234567890",
    "accountName": "HOTEL BOOKING",
    "memo": "BILL-202501-00001",
    "qrDataURL": "https://api.qrserver.com/v1/... or base64 string",
    "qrText": "00020126360014..."
  },
  "message": "QR code generated"
}
```

## Key Features Implemented

✅ **Dynamic QR Code Generation** - Real bank details, amounts, and references
✅ **Polling System** - Real-time payment status checks every 3 seconds
✅ **Countdown Timer** - 5-minute auto-timeout with visual alerts
✅ **Webhook Integration** - Receive payment notifications from banks
✅ **Room Card Reactivity** - Auto-update room availability after payment
✅ **Payment Confirmation** - Manual confirm option for testing
✅ **Status Messages** - Clear success/error/timeout notifications
✅ **Auto-Cleanup** - Paid bills auto-removed from modal
✅ **Fallback QR Service** - Works even without VietQR credentials
✅ **Payment Fields** - Comprehensive payment tracking in Bill model

## Troubleshooting

### QR Code Not Displaying

1. Check browser console for fetch errors
2. Verify token is valid: `localStorage.getItem('auth_token')`
3. Test endpoint manually: `GET /api/webhooks/qr/bill-id`
4. If still blank, VietQR not configured but fallback should work

### Polling Not Detecting Payment

1. Check Network tab: GET /bills/:id/status should return regularly
2. Verify webhook was received: Check backend logs for "📥 Webhook received"
3. Check Bill document: `paymentStatus` field should be "paid"
4. Manual confirm: Click "Đã thanh toán" button as alternative

### Room Not Updating After Payment

1. Check browser console for `roomUpdated` event dispatch
2. Verify Room_Card component is mounted
3. Test endpoint: `GET /api/rooms/room-id` returns correct availability
4. Hard refresh if needed: Ctrl+Shift+R (Cmd+Shift+R on Mac)

### Wrong Amount in QR Code

1. Verify Bill.finalAmount is correct in MongoDB
2. Check calculateBillTotal logic in billController
3. Ensure no rounding errors: amounts should be in smallest currency unit (VND cents)

## Production Deployment Checklist

- [ ] Add VietQR credentials to production .env
- [ ] Implement webhook signature verification (currently accepts all)
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS whitelist for production domain
- [ ] Test with real bank account
- [ ] Set up monitoring/alerting for webhook failures
- [ ] Implement retry logic for failed payments
- [ ] Add rate limiting to webhook endpoint
- [ ] Set up database backups and recovery procedures
- [ ] Document webhook payload format from your payment provider

## Future Enhancements

- [ ] Multiple payment method support (Credit card, E-wallet)
- [ ] Payment retry mechanism
- [ ] Partial payment tracking and reminders
- [ ] Payment receipt generation and email
- [ ] Refund processing
- [ ] Admin payment dashboard with analytics
- [ ] SMS/Email notifications on payment status
- [ ] Socket.IO for real-time updates (instead of polling)
- [ ] Payment history and transaction audit logs
