# Review Module Documentation

## Overview
Complete review system where users can review event hosts with rating validation, duplicate prevention, and automatic statistics tracking.

## Review Rules
1. ✅ User can give review to host only once per event
2. ✅ Host cannot review their own event
3. ✅ Host can review other hosts' events
4. ✅ Rating must be between 0 and 5
5. ✅ Only logged-in users can create reviews
6. ✅ Reviews are public (anyone can view)
7. ✅ Admin can update and delete any review
8. ✅ Users can update their own reviews
9. ✅ Only admin can delete reviews
10. ✅ Auto-increment reviewCount for host when review created
11. ✅ Auto-decrement reviewCount for host when review deleted

## API Endpoints

### 1. Create Review
**POST** `/api/review/`
**Auth Required:** Yes (USER, HOST, ADMIN)

**Request Body:**
```json
{
  "rating": 4.5,
  "comment": "Great event host! Very organized and professional.",
  "eventId": "event-uuid-here"
}
```

**Validation:**
- `rating`: Required, number between 0 and 5
- `comment`: Optional, string
- `eventId`: Required, valid event UUID

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Review created successfully!",
  "data": {
    "id": "review-uuid",
    "rating": 4.5,
    "comment": "Great event host!",
    "eventId": "event-uuid",
    "userId": "user-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "profilePhoto": "https://..."
    }
  }
}
```

**Error Cases:**
- 404: Event not found
- 400: Cannot review your own event
- 400: You have already reviewed this host
- 400: Rating must be between 0 and 5

---

### 2. Get All Reviews
**GET** `/api/review/`
**Auth Required:** No (Public)

**Query Parameters:**
- `userId` - Filter by reviewer
- `eventId` - Filter by event
- `rating` - Filter by rating
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - asc/desc (default: desc)

**Example:**
```
GET /api/review/?eventId=event-uuid&page=1&limit=10
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Reviews retrieved successfully!",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25
  },
  "data": [
    {
      "id": "review-uuid",
      "rating": 5,
      "comment": "Excellent host!",
      "eventId": "event-uuid",
      "userId": "user-uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "fullName": "Jane Smith",
        "email": "jane@example.com",
        "profilePhoto": "https://..."
      }
    }
  ]
}
```

---

### 3. Get Review by ID
**GET** `/api/review/:id`
**Auth Required:** No (Public)

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Review retrieved successfully!",
  "data": {
    "id": "review-uuid",
    "rating": 4,
    "comment": "Good experience",
    "eventId": "event-uuid",
    "userId": "user-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "profilePhoto": "https://..."
    }
  }
}
```

---

### 4. Update Review
**PATCH** `/api/review/:id`
**Auth Required:** Yes (USER, HOST, ADMIN)
**Authorization:** Admin or review owner only

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Updated: Amazing host!"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Review updated successfully!",
  "data": {
    "id": "review-uuid",
    "rating": 5,
    "comment": "Updated: Amazing host!",
    "eventId": "event-uuid",
    "userId": "user-uuid",
    "updatedAt": "2024-01-02T00:00:00.000Z",
    "user": {...}
  }
}
```

**Error Cases:**
- 404: Review not found
- 403: Not authorized to update this review

---

### 5. Delete Review
**DELETE** `/api/review/:id`
**Auth Required:** Yes (ADMIN only)

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Review deleted successfully!",
  "data": {
    "message": "Review deleted successfully!"
  }
}
```

**Error Cases:**
- 404: Review not found
- 403: Only admin can delete reviews

---

### 6. Get Host Review Statistics
**GET** `/api/review/host/:hostId/stats`
**Auth Required:** No (Public)

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Host review stats retrieved successfully!",
  "data": {
    "hostId": "host-uuid",
    "hostName": "John Host",
    "totalEvents": 15,
    "totalReviews": 42,
    "averageRating": 4.65
  }
}
```

**Calculation:**
- `totalEvents`: From user.hostedEvents
- `totalReviews`: From user.reviewCount
- `averageRating`: Average of all ratings from reviews on host's events (rounded to 2 decimals)

**Error Cases:**
- 404: Host not found
- 400: User is not a host

---

## Database Schema

### Review Model
```prisma
model Review {
    id          String     @id @default(uuid())
    rating      Int        @default(0)
    comment     String?
    reviewCount Int        @default(0)
    createdAt   DateTime   @default(now())
    updatedAt   DateTime   @updatedAt
    userId      String
    eventId     String
    user        User       @relation(fields: [userId], references: [id])
    @@map("reviews")
}
```

### User Model (Updated)
```prisma
model User {
    ...
    pertcipatedEvents  Int        @default(0)
    hostedEvents       Int        @default(0)
    reviewCount        Int        @default(0)  // NEW FIELD
    ...
    reviews            Review[]
}
```

---

## Automatic Counters

### reviewCount (User)
- **Increments:** When a review is created for any of the host's events
- **Decrements:** When a review is deleted
- **Protected:** Cannot be manually updated by users

---

## Business Logic Flow

### Creating a Review
1. Verify user is authenticated
2. Check if event exists
3. Verify user is not the event host (cannot review own event)
4. Check if user already reviewed this host (one review per event)
5. Validate rating (0-5)
6. Create review
7. Increment host's reviewCount
8. Return review with user details

### Deleting a Review
1. Verify user is admin
2. Check if review exists
3. Get associated event
4. Delete review
5. Decrement host's reviewCount
6. Return success message

### Getting Host Stats
1. Verify host exists and is HOST role
2. Get all events hosted by user
3. Get all reviews for those events
4. Calculate average rating
5. Return stats with totalEvents, totalReviews, averageRating

---

## Example Usage

### User Reviews a Host
```bash
# User participates in event
POST /api/event/event-123/participate
Authorization: Bearer <user-token>

# User reviews the host after event
POST /api/review/
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent event organization!",
  "eventId": "event-123"
}
```

### Get Host Statistics
```bash
# Anyone can view host stats
GET /api/review/host/host-uuid-123/stats

# Response shows:
# - Total events hosted: 20
# - Total reviews received: 45
# - Average rating: 4.73
```

### Admin Deletes Inappropriate Review
```bash
DELETE /api/review/review-uuid-456
Authorization: Bearer <admin-token>
```

---

## Features Implemented

✅ Create review with rating validation (0-5)
✅ Prevent duplicate reviews (one per event)
✅ Prevent self-review (host cannot review own event)
✅ Public review viewing
✅ Authenticated review creation
✅ Update own review or admin update any
✅ Admin-only delete
✅ Auto-increment/decrement reviewCount
✅ Host statistics endpoint
✅ Average rating calculation
✅ Pagination and filtering
✅ User details in review responses

---

## Migration Required

After adding reviewCount to User model, run:
```bash
npm run migrate
```

This will add the `reviewCount` field to the users table.
