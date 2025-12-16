# Database Migration Guide - User-Specific Data Isolation

## Overview

This migration adds user-specific data ownership to the database. Each user now has unique rooms, menu items, and promotions, preventing data sharing between users.

## Changes Made

### 1. Database Schema Updates

#### Room Model

- **Added field**: `user` (ObjectId, optional reference to User)
- **Purpose**: Each room can now belong to a specific user or be global (if user is null)
- **Backward compatibility**: Existing rooms without a user are treated as global system rooms

#### MenuItem Model

- **Added field**: `user` (ObjectId, optional reference to User)
- **Purpose**: Each menu item (food/drink) can belong to a specific user or be global
- **Backward compatibility**: Existing items without a user are treated as global system items

#### Promotion Model

- **Added field**: `user` (ObjectId, optional reference to User)
- **Purpose**: Each promotion can be personalized per user or be global
- **Backward compatibility**: Existing promotions without a user are treated as global system promotions

#### Bill Model

- **No changes**: Already has `user` field for proper isolation ✓

#### Booking Model

- **No changes**: Already has `user` field for proper isolation ✓

### 2. API Changes

#### Room Controller (`roomController.ts`)

All endpoints now support user-specific rooms:

- `getAllRooms()`: Returns user's rooms + global system rooms
- `getRoomsByLocation()`: Returns user's + global rooms for a location
- `createRoom()`: Automatically assigns room to current user
- `updateRoom()`: Only user who created the room can update
- `deleteRoom()`: Only user who created the room can delete

#### MenuItem Controller (`menuItemController.ts`)

All endpoints now support user-specific items:

- `getAllMenuItems()`: Returns user's items + global system items
- `getMenuItemsByCategory()`: Returns user's + global items in a category
- `createMenuItem()`: Automatically assigns item to current user
- `updateMenuItem()`: Only user who created the item can update
- `deleteMenuItem()`: Only user who created the item can delete
- `getCategories()`: Shows categories from user's + global items
- `getPopularMenuItems()`: Shows popular items from user's + global items

#### Promotion Controller (`promotionController.ts`)

- `getPromotions()`: Returns user's promotions + global system promotions

### 3. Data Isolation Logic

All queries now use MongoDB `$or` operator to fetch either:

- **User-owned items**: `{ user: userId }`
- **Global items**: `{ user: { $eq: null } }`

```javascript
// Example query pattern
{
  $or: [
    { user: userId }, // User's own items
    { user: { $eq: null } }, // Global/system items
  ];
}
```

## Database Migration Steps

### Option 1: Fresh Database (Recommended for Development)

1. Delete current database
2. Restart the application
3. System will create new collections with proper schema

### Option 2: Existing Database Migration

Execute these MongoDB commands to add the `user` field to existing documents:

```javascript
// For existing rooms (they become global rooms)
db.rooms.updateMany({ user: { $exists: false } }, { $set: { user: null } });

// For existing menu items (they become global items)
db.menuitems.updateMany({ user: { $exists: false } }, { $set: { user: null } });

// For existing promotions (they become global promotions)
db.promotions.updateMany(
  { user: { $exists: false } },
  { $set: { user: null } }
);

// For bills (ensure user field exists)
db.bills.updateMany({ user: { $exists: false } }, { $set: { user: null } });

// For bookings (ensure user field exists)
db.bookings.updateMany({ user: { $exists: false } }, { $set: { user: null } });
```

## Behavior After Migration

### For Existing Users

1. All previously created (global) rooms are visible to all users
2. All previously created (global) menu items are visible to all users
3. All previously created (global) promotions are visible to all users
4. Users can create their own personal versions if needed

### For New Users

1. See only their own created rooms/items/promotions
2. Also see all global system rooms/items/promotions
3. Cannot modify global items (only their own)

## Testing Checklist

- [ ] User A creates a custom room - only User A sees it
- [ ] User B cannot see User A's custom room
- [ ] Both users see global system rooms
- [ ] User A can update their own room
- [ ] User A cannot update User B's room
- [ ] User A cannot update global system rooms
- [ ] Same tests for menu items
- [ ] Same tests for promotions
- [ ] Bill data is properly isolated by user
- [ ] Booking data is properly isolated by user

## API Response Examples

### Get All Rooms (User B logged in)

```json
{
  "success": true,
  "data": [
    { "_id": "...", "name": "User B's Custom Suite", "user": "user_b_id", ... },
    { "_id": "...", "name": "System Deluxe", "user": null, ... },
    { "_id": "...", "name": "System Suite", "user": null, ... }
  ]
}
```

### Create Room (as User A)

```javascript
POST /api/rooms
// Automatically sets user: user_a_id
{
  "name": "User A's VIP Room",
  "type": "Presidential",
  // ... other fields
}
```

## Rollback Instructions

If you need to rollback:

1. Remove `user` field from Room schema
2. Remove `user` field from MenuItem schema
3. Remove `user` field from Promotion schema
4. Revert controller changes (git checkout previous version)
5. Execute: `db.rooms.updateMany({}, { $unset: { user: "" } })`

## Performance Considerations

- Added index on `user` field for faster queries
- All queries use `$or` for user + global items (indexed)
- Consider adding composite indexes if performance issues arise

## Security Notes

- Users can only update/delete their own items
- Global items (user: null) can only be modified by admins
- All operations verify user ownership before allowing changes
- Frontend should cache user-specific data separately
