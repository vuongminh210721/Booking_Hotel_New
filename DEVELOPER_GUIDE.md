# User Data Isolation - Implementation Guide for Developers

## 🎯 Quick Start

### What Changed?

Each database collection (Room, MenuItem, Promotion) now supports user-specific data:

- **User-specific items**: `user: <userId>` - only that user can modify
- **Global items**: `user: null` - available to all, read-only by users

### How to Use

#### Backend: Creating User-Specific Items

**Before**:

```typescript
const room = await Room.create(req.body);
```

**After** (Automatically handled by controller):

```typescript
const userId = req.user._id;
const roomData = { ...req.body, user: userId };
const room = await Room.create(roomData);
```

All controllers already do this - just ensure `req.user._id` is available!

#### Backend: Fetching Data

**Before**:

```typescript
const rooms = await Room.find({ availability: true });
```

**After** (Automatically filters user + global):

```typescript
const userId = req.user._id;
const rooms = await Room.find({
  availability: true,
  $or: [
    { user: userId }, // User's own rooms
    { user: { $eq: null } }, // Global system rooms
  ],
});
```

Controllers already do this pattern!

#### Backend: Update/Delete with Permission Check

**Pattern Used in Updated Controllers**:

```typescript
// First: Verify ownership
const item = await Room.findOne({
  _id: req.params.id,
  $or: [
    { user: userId }, // User can modify their own
    { user: { $eq: null } }, // System items (if admin)
  ],
});

if (!item) {
  throw new AppError("Item not found or permission denied", 404);
}

// Then: Update/Delete
await Room.findByIdAndUpdate(req.params.id, updateData, { new: true });
```

## 📊 Data Model Examples

### Room Document (User-Specific)

```javascript
{
  _id: ObjectId("60d5ec49f1b2c72b8c8e1a1a"),
  user: ObjectId("60d5ec49f1b2c72b8c8e0000"),  // ← User A's custom room
  name: "User A's Premium Suite",
  type: "Suite",
  price: 500000,
  // ... other fields
}
```

### Room Document (Global/System)

```javascript
{
  _id: ObjectId("60d5ec49f1b2c72b8c8e1b2b"),
  user: null,                                    // ← Global room
  name: "Standard Deluxe",
  type: "Deluxe",
  price: 300000,
  // ... other fields
}
```

## 🔍 Common Queries Reference

### Get All Items (User + Global)

```typescript
const userId = req.user._id;

// For Rooms
const rooms = await Room.find({
  $or: [{ user: userId }, { user: { $eq: null } }],
});

// For Menu Items
const items = await MenuItem.find({
  $or: [{ user: userId }, { user: { $eq: null } }],
});

// For Promotions
const promos = await Promotion.find({
  isActive: true,
  $or: [{ user: userId }, { user: { $eq: null } }],
});
```

### Get User's Personal Items Only

```typescript
const userId = req.user._id;

const userRooms = await Room.find({ user: userId });
const userItems = await MenuItem.find({ user: userId });
```

### Get Global Items Only

```typescript
const globalRooms = await Room.find({ user: null });
const globalItems = await MenuItem.find({ user: null });
```

### Verify User Can Modify Item

```typescript
const userId = req.user._id;
const itemId = req.params.id;

const item = await Room.findOne({
  _id: itemId,
  user: userId, // ← Only user's own items
});

if (!item) {
  throw new AppError("Item not found or you don't have permission", 403);
}

// Proceed with update/delete
```

## 🛠️ Controller Pattern

All updated controllers follow this pattern:

```typescript
export const functionName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id; // ← Get user ID from token

    // Build filter with user + global logic
    const filter = {
      // ... other conditions
      $or: [
        { user: userId }, // User's items
        { user: { $eq: null } }, // Global items
      ],
    };

    // Execute query
    const results = await Model.find(filter);

    res.json(successResponse(results));
  } catch (error) {
    next(error);
  }
};
```

## 📝 Adding New User-Specific Features

When adding new user-specific data to another model:

### 1. Update Schema

```typescript
const NewSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false, // Allow global items too
  },
  // ... other fields
});
```

### 2. Update Create Function

```typescript
export const create = async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  const data = { ...req.body, user: userId }; // ← Add user
  const item = await Model.create(data);
  res.status(201).json(successResponse(item));
};
```

### 3. Update Get Functions

```typescript
export const getAll = async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  const items = await Model.find({
    $or: [
      { user: userId }, // ← User's items
      { user: { $eq: null } }, // ← Global items
    ],
  });
  res.json(successResponse(items));
};
```

### 4. Update Update/Delete Functions

```typescript
export const update = async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;

  // ← Verify ownership
  const item = await Model.findOne({
    _id: req.params.id,
    user: userId,
  });

  if (!item) {
    throw new AppError("Item not found or permission denied", 404);
  }

  const updated = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(successResponse(updated));
};
```

## 🔐 Security Rules

### ✅ DO

- Always extract `userId` from `req.user._id`
- Always use `$or` to include both user and global items
- Always verify ownership before update/delete
- Always return 404 or 403 for permission denied

### ❌ DON'T

- Don't forget to assign `user: userId` when creating
- Don't allow modifications of global items (user: null) by regular users
- Don't expose user IDs in responses unnecessarily
- Don't cache user-agnostic queries

## 🧪 Testing User Isolation

### Manual Test Steps

```bash
# 1. Create User A and User B (different browsers/tokens)

# 2. User A creates a custom room
POST /api/rooms
{
  "name": "User A's Room",
  "type": "Suite",
  ...
}
# Response: { user: "<userA_id>", name: "User A's Room", ... }

# 3. User B fetches all rooms
GET /api/rooms
# Response should include:
# - User A's Room ✗ (SHOULD NOT APPEAR)
# - User B's Room ✓ (appears only if B created it)
# - Global System Rooms ✓ (appear for all users)

# 4. User B tries to update User A's room
PUT /api/rooms/<userA_roomId>
# Response: 404 "Room not found or permission denied"

# 5. User B creates their own room
POST /api/rooms
{
  "name": "User B's Room",
  ...
}

# 6. User B can update their own room
PUT /api/rooms/<userB_roomId>
# Response: 200 "Room updated successfully"
```

## 📈 Query Performance

### Index Recommendations

```javascript
// Add these indexes for better performance
db.rooms.createIndex({ user: 1 });
db.rooms.createIndex({ user: 1, availability: 1 });

db.menuitems.createIndex({ user: 1 });
db.menuitems.createIndex({ user: 1, category: 1 });

db.promotions.createIndex({ user: 1 });
db.promotions.createIndex({ user: 1, isActive: 1 });
```

### Query Performance Pattern

MongoDB efficiently handles `$or` queries when:

- Both branches are indexed
- Result set is relatively small
- Regular pagination applied

## 🐛 Debugging

### Check Item Ownership

```javascript
// In MongoDB console
db.rooms.findOne({ _id: ObjectId("...") });
// Check the 'user' field:
// - user: <userObjectId> → User-specific
// - user: null → Global

// Find all of User A's items
db.rooms.find({ user: ObjectId("userA_id") });

// Find all global items
db.rooms.find({ user: null });
```

### Check Controller Filter

Add logging in controller:

```typescript
const filter = {
  $or: [{ user: userId }, { user: { $eq: null } }],
};
console.log("Filter:", filter); // ← Debug filter
const items = await Model.find(filter);
console.log("Results:", items); // ← Debug results
```

## 📚 Related Files

### Models

- `backend/src/models/Room.ts` - Now has user field
- `backend/src/models/MenuItem.ts` - Now has user field
- `backend/src/models/Promotion.ts` - Now has user field
- `backend/src/models/Bill.ts` - Already has user field
- `backend/src/models/Booking.ts` - Already has user field

### Controllers

- `backend/src/controllers/roomController.ts` - Updated (6 functions)
- `backend/src/controllers/menuItemController.ts` - Updated (8 functions)
- `backend/src/controllers/promotionController.ts` - Updated (1 function)

### Documentation

- `DATABASE_MIGRATION_GUIDE.md` - Migration steps
- `USER_DATA_ISOLATION_IMPLEMENTATION.md` - Complete implementation details

## 🎯 Key Takeaways

1. **Every item now has an owner** (user) or is global (user: null)
2. **Queries automatically include both user items and global items**
3. **Permission checks prevent users from modifying others' items**
4. **Frontend doesn't need changes** - APIs work the same way
5. **Data isolation is enforced at database level** - more secure

## ❓ FAQ

**Q: What if I want to migrate existing items to a user?**

```javascript
db.rooms.updateMany(
  { _id: ObjectId("...") },
  { $set: { user: ObjectId("userA_id") } }
);
```

**Q: How do I make an item global?**

```javascript
db.rooms.updateMany({ _id: ObjectId("...") }, { $set: { user: null } });
```

**Q: Can admins see all users' items?**
A: This system treats null items as global. For full admin access, consider adding a separate `role` check.

**Q: Why use `$eq: null` instead of `user: null`?**
A: `$eq: null` explicitly matches null values, `user: null` also matches missing fields.

**Q: Performance impact?**
A: Minimal with proper indexes. MongoDB optimizes `$or` queries well.

---

**Need help?** Check the test cases or refer to existing controller implementations.
