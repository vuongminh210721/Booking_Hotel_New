# 🗄️ Database Schema

## MongoDB Collections

### 1. Users

```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  avatarUrl: String (optional),
  address: String (optional),
  gender: String (Nam/Nữ/Khác),
  dateOfBirth: Date (optional),
  hometown: String (optional),
  customerType: String (thường/vip),
  bookedRooms: [ObjectId], // References to Rooms
  role: String (user/admin),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Rooms

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  longDescription: String (optional),
  location: String (Tp Hồ Chí Minh/Hà Nội/Đà Nẵng),
  type: String (standard/deluxe/suite),
  price: Number,
  capacity: Number,
  floor: Number (optional),
  amenities: [String], // WiFi, AC, TV, etc.
  images: [String], // URLs
  galleryImages: [String],
  rating: Number (0-5),
  reviewCount: Number,
  isAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Bookings

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  roomId: ObjectId, // Reference to Room
  checkInDate: Date,
  checkOutDate: Date,
  guests: Number,
  totalPrice: Number,
  paymentMethod: String (deposit/full/paypal/vnpay),
  status: String (pending/confirmed/cancelled/completed),
  notes: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Reviews

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  roomId: ObjectId, // Reference to Room
  bookingId: ObjectId, // Reference to Booking
  rating: Number (1-5),
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Services

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  longDescription: String (optional),
  category: String (hotel_service/spa_wellness/food_beverage/transportation/activities),
  price: Number,
  duration: String, // "60 phút"
  image: String (URL),
  images: [String],
  isAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Policies

```javascript
{
  _id: ObjectId,
  title: String,
  slug: String (unique),
  content: String (HTML),
  category: String (check-in/payment/cancellation/terms),
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Promotions

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  discount: Number, // Percentage (0-100) or fixed amount
  code: String (optional, unique),
  validFrom: Date,
  validTo: Date,
  maxUses: Number (optional),
  usedCount: Number,
  applicableRooms: [String], // Room types or IDs
  conditions: [String], // Terms
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 8. MenuItems

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  category: String (appetizers/mains/desserts/beverages),
  price: Number,
  image: String (URL),
  isAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 9. Locations

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  images: [String],
  highlights: [String],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Quan hệ (Relationships)

```
User
  ├── Bookings (1-to-many)
  ├── Reviews (1-to-many)
  └── Profile

Booking
  ├── User (many-to-1)
  ├── Room (many-to-1)
  └── Review (1-to-1 optional)

Room
  ├── Bookings (1-to-many)
  └── Reviews (1-to-many)

Review
  ├── User (many-to-1)
  ├── Room (many-to-1)
  └── Booking (many-to-1)
```

---

## Indexes

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 });
db.users.createIndex({ createdAt: -1 });

// Bookings
db.bookings.createIndex({ userId: 1 });
db.bookings.createIndex({ roomId: 1 });
db.bookings.createIndex({ checkInDate: 1, checkOutDate: 1 });
db.bookings.createIndex({ status: 1 });

// Reviews
db.reviews.createIndex({ roomId: 1 });
db.reviews.createIndex({ userId: 1 });
db.reviews.createIndex({ createdAt: -1 });

// Promotions
db.promotions.createIndex({ code: 1 }, { unique: true, sparse: true });
db.promotions.createIndex({ validFrom: 1, validTo: 1 });
```

---

## Seeding Data

Run:

```bash
npm run seed
```

This populates the database with:

- 3 Users (1 admin, 2 regular)
- 15 Rooms (various types & locations)
- 8 Services
- 6 Policies
- 5 Promotions
- etc.

---

**Last Updated**: 2025-12-04
