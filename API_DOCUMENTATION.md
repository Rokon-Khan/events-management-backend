# Event Management Backend API Documentation

## Overview
Complete event management system with user authentication, profile management, and event CRUD operations.

## Authentication Flow

### 1. User Registration
**POST** `/api/auth/registration`
```json
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "password": "password123",
  "role": "HOST"
}
```
Response: User created and OTP sent to email

Notes:
- `role` is optional, defaults to "USER" if not provided
- Available roles: "USER", "HOST", "ADMIN"
- OTP is automatically sent after registration

**POST** `/api/auth/verify-email`
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```
Response: Email verified successfully

### 2. User Login
**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 3. Other Auth Endpoints
- **POST** `/api/auth/logout`
- **POST** `/api/auth/change-password`
- **POST** `/api/auth/forgot-password`
- **POST** `/api/auth/reset-password`
- **GET** `/api/auth/me`

## User Module

### Get My Profile
**GET** `/api/user/me`
Headers: `Authorization: Bearer <token>`

### Update My Profile
**PATCH** `/api/user/update-my-profile`
Headers: `Authorization: Bearer <token>`
Content-Type: `multipart/form-data` or `application/json`

```json
{
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "bio": "Event enthusiast",
  "interests": ["music", "sports", "technology"],
  "gender": "MALE",
  "dateOfBirth": "1990-01-01",
  "profilePhoto": "<file>"
}
```

### Admin Endpoints
- **GET** `/api/user/` - Get all users (Admin only)
- **GET** `/api/user/:id` - Get user by ID (Admin only)
- **PATCH** `/api/user/:id/status` - Change user status (Admin only)

## Event Module

### Create Event
**POST** `/api/event/`
Headers: `Authorization: Bearer <token>`
Roles: `ADMIN`, `HOST`
Content-Type: `multipart/form-data`

```
title: "Tech Conference 2024"
description: "Annual technology conference"
eventImage: <file>
eventCategory: "Technology"
date: "2024-12-31"
time: "10:00 AM"
location: "Convention Center"
minParticipants: 10
maxParticipants: 100
joiningFee: 50.00
```

### Get All Events
**GET** `/api/event/`
Query Parameters:
- `searchTerm` - Search in title, description, category, location
- `status` - Filter by event status
- `eventCategory` - Filter by category
- `userId` - Filter by host
- `page` - Page number
- `limit` - Items per page
- `sortBy` - Sort field
- `sortOrder` - asc/desc

### Get Event by ID
**GET** `/api/event/:id`

### Update Event
**PATCH** `/api/event/:id`
Headers: `Authorization: Bearer <token>`
Roles: `ADMIN`, `HOST` (only event creator)
Content-Type: `multipart/form-data`

```
title: "Updated Title"
status: "ONGOING"
eventImage: <file>
```

### Delete Event
**DELETE** `/api/event/:id`
Headers: `Authorization: Bearer <token>`
Roles: `ADMIN` only

### Participate in Event
**POST** `/api/event/:id/participate`
Headers: `Authorization: Bearer <token>`
Roles: `USER`, `HOST`

Rules:
- Only OPEN and ONGOING events allow participation
- Cannot participate if event is FULL, UPCOMING, COMPLETED, CANCELLED, or CLOSED
- Automatically increments user's `pertcipatedEvents` counter
- Automatically increments event's `currentParticipants`
- Changes event status to FULL when max participants reached

## Event Status Management

### Automatic Status Updates
- Events are automatically marked as CLOSED when date/time passes
- Status check runs every 60 seconds
- Manual status updates available for ADMIN and HOST

### Event Statuses
- `OPEN` - Accepting participants
- `FULL` - Max participants reached
- `UPCOMING` - Scheduled but not started
- `ONGOING` - Currently happening
- `COMPLETED` - Finished successfully
- `CANCELLED` - Cancelled by host/admin
- `CLOSED` - Past date/time

## User Roles
- `USER` - Regular user, can participate in events
- `HOST` - Can create and manage own events
- `ADMIN` - Full system access

## Features Implemented

### User Module
✅ Single-step registration with optional role selection
✅ Email OTP verification
✅ Login with email/password
✅ Profile management with image upload
✅ Auto-increment participated events counter
✅ Auto-increment hosted events counter
✅ Support for bio and interests array
✅ Gender and date of birth fields

### Event Module
✅ Full CRUD operations
✅ Image upload to Cloudinary
✅ Accept both JSON and Form Data
✅ Auto-close events after date/time
✅ Participation management
✅ Status-based participation rules
✅ Search and filter functionality
✅ Pagination support
✅ Role-based access control

### File Upload
✅ Cloudinary integration
✅ Support for profile photos
✅ Support for event images
✅ Automatic old image deletion

## Review Module

### Create Review
**POST** `/api/review/`
Headers: `Authorization: Bearer <token>`
Roles: `USER`, `HOST`, `ADMIN`

```json
{
  "rating": 4.5,
  "comment": "Great event host!",
  "eventId": "event-uuid"
}
```

Rules:
- Rating must be between 0 and 5
- User can review host only once per event
- Host cannot review their own event
- Auto-increments host's reviewCount

### Get All Reviews
**GET** `/api/review/`
Query Parameters: `userId`, `eventId`, `rating`, `page`, `limit`

### Get Host Statistics
**GET** `/api/review/host/:hostId/stats`
Returns: totalEvents, totalReviews, averageRating

### Update Review
**PATCH** `/api/review/:id`
Roles: `ADMIN` or review owner

### Delete Review
**DELETE** `/api/review/:id`
Roles: `ADMIN` only

## Environment Variables Required
```
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
EXPIRES_IN=
REFRESH_TOKEN_EXPIRES_IN=
SALT_ROUND=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
