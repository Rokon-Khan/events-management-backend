# Become Host Module Documentation

## Overview
Complete system for users to request HOST role and admin approval process.

---

## Features

✅ **User Request** - USER role can request to become HOST
✅ **Admin Create** - Admin can directly upgrade USER to HOST
✅ **One Request Per User** - Users can only submit one request
✅ **Admin Approval** - Admin can approve requests to upgrade role
✅ **Full CRUD** - Get all, get by ID, update, delete
✅ **Role Validation** - Only USER role can request HOST
✅ **Automatic Role Update** - Role changes from USER to HOST on approval

---

## API Endpoints

### 1. Create Become Host Request (User)
**POST** `/api/v1/become-host/`
**Auth Required:** Yes (USER only)

**Request Body:**
```json
{
  "hostExperience": "5 years of event management experience",
  "typeOfEvents": "Tech conferences, workshops, meetups",
  "whyHost": "I'm passionate about bringing people together and creating memorable experiences"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Become host request submitted successfully!",
  "data": {
    "id": "request-uuid",
    "userId": "user-uuid",
    "hostExperience": "5 years of event management experience",
    "typeOfEvents": "Tech conferences, workshops, meetups",
    "whyHost": "I'm passionate about bringing people together",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    }
  }
}
```

**Validation:**
- ✅ User must have USER role
- ✅ User can only submit one request
- ✅ All fields required

**Error Cases:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Only USER role can request to become HOST!"
}
```

```json
{
  "statusCode": 400,
  "success": false,
  "message": "You have already submitted a request!"
}
```

---

### 2. Create Host by Admin
**POST** `/api/v1/become-host/admin/create`
**Auth Required:** Yes (ADMIN only)

**Request Body:**
```json
{
  "userId": "user-uuid-here",
  "hostExperience": "10 years of professional event management",
  "typeOfEvents": "All types of events",
  "whyHost": "Admin approved based on credentials"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "User upgraded to HOST successfully!",
  "data": {
    "id": "request-uuid",
    "userId": "user-uuid",
    "hostExperience": "10 years of professional event management",
    "typeOfEvents": "All types of events",
    "whyHost": "Admin approved based on credentials",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "fullName": "Jane Smith",
      "email": "jane@example.com",
      "role": "HOST"
    }
  }
}
```

**What Happens:**
1. ✅ Creates become host record
2. ✅ Immediately upgrades user role to HOST
3. ✅ User can now create events

**Use Case:** Admin wants to directly approve a user without waiting for request.

---

### 3. Get All Become Host Requests
**GET** `/api/v1/become-host/`
**Auth Required:** Yes (ADMIN only)

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - asc/desc (default: desc)

**Example:**
```
GET /api/v1/become-host/?page=1&limit=10
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Become host requests retrieved successfully!",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25
  },
  "data": [
    {
      "id": "request-uuid",
      "userId": "user-uuid",
      "hostExperience": "5 years experience",
      "typeOfEvents": "Tech events",
      "whyHost": "Passionate about events",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "fullName": "John Doe",
        "email": "john@example.com",
        "role": "USER",
        "profilePhoto": "https://..."
      }
    }
  ]
}
```

---

### 4. Get Become Host Request By ID
**GET** `/api/v1/become-host/:id`
**Auth Required:** Yes (ADMIN only)

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Request retrieved successfully!",
  "data": {
    "id": "request-uuid",
    "userId": "user-uuid",
    "hostExperience": "5 years experience",
    "typeOfEvents": "Tech events",
    "whyHost": "Passionate about events",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "profilePhoto": "https://..."
    }
  }
}
```

---

### 5. Approve Host Request (Update)
**PATCH** `/api/v1/become-host/:id`
**Auth Required:** Yes (ADMIN only)

**Request Body:**
```json
{
  "approveHost": true
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Request updated successfully!",
  "data": {
    "id": "request-uuid",
    "userId": "user-uuid",
    "hostExperience": "5 years experience",
    "typeOfEvents": "Tech events",
    "whyHost": "Passionate about events",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "HOST"
    }
  }
}
```

**What Happens:**
1. ✅ User role updated from USER to HOST
2. ✅ Request updatedAt timestamp updated
3. ✅ User can now create events

**Error Cases:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "User is already a HOST!"
}
```

---

### 6. Delete Become Host Request
**DELETE** `/api/v1/become-host/:id`
**Auth Required:** Yes (ADMIN only)

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Request deleted successfully!",
  "data": {
    "message": "Request deleted successfully!"
  }
}
```

**Use Case:** Admin rejects request or user withdraws request.

---

## Database Schema

### becomeHost Model
```prisma
model becomeHost {
  id               String   @id @default(uuid())
  userId           String
  hostExperience   String
  typeOfEvents     String
  whyHost          String
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  user             User     @relation(fields: [userId], references: [id])
  @@map("become_host")
}
```

### User Model (Updated)
```prisma
model User {
  ...
  becomeHostRequest becomeHost?
  ...
}
```

---

## Business Rules

### 1. User Request
- ✅ Only USER role can request
- ✅ One request per user
- ✅ All fields required
- ✅ Request stored in database

### 2. Admin Create
- ✅ Admin can create for any USER
- ✅ Immediately upgrades to HOST
- ✅ Creates request record
- ✅ One request per user

### 3. Admin Approval
- ✅ Admin can approve pending requests
- ✅ User role changes to HOST
- ✅ User can create events
- ✅ Cannot approve if already HOST

### 4. Request Deletion
- ✅ Admin can delete any request
- ✅ Does not affect user role
- ✅ Use for rejected requests

---

## User Flow

### User Requests to Become Host
```
1. User (role: USER) submits request
   ↓
2. Request stored in database
   ↓
3. Admin reviews request
   ↓
4. Admin approves (PATCH with approveHost: true)
   ↓
5. User role updated to HOST
   ↓
6. User can now create events
```

### Admin Directly Creates Host
```
1. Admin selects USER
   ↓
2. Admin creates host request with userId
   ↓
3. Request created + User role updated to HOST
   ↓
4. User can immediately create events
```

---

## Role-Based Access

### USER Role
- ✅ Can create become host request
- ❌ Cannot view all requests
- ❌ Cannot approve requests
- ❌ Cannot delete requests

### HOST Role
- ❌ Cannot create become host request (already HOST)
- ❌ Cannot view requests
- ❌ Cannot approve requests

### ADMIN Role
- ✅ Can view all requests
- ✅ Can create host for any USER
- ✅ Can approve requests
- ✅ Can delete requests
- ✅ Full access to module

---

## Example Usage

### User Submits Request
```bash
curl -X POST http://localhost:5000/api/v1/become-host/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user-token>" \
  -d '{
    "hostExperience": "5 years of event management",
    "typeOfEvents": "Tech conferences, workshops",
    "whyHost": "Passionate about bringing people together"
  }'
```

### Admin Views All Requests
```bash
curl -X GET http://localhost:5000/api/v1/become-host/?page=1&limit=10 \
  -H "Authorization: Bearer <admin-token>"
```

### Admin Approves Request
```bash
curl -X PATCH http://localhost:5000/api/v1/become-host/request-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "approveHost": true
  }'
```

### Admin Creates Host Directly
```bash
curl -X POST http://localhost:5000/api/v1/become-host/admin/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "userId": "user-uuid",
    "hostExperience": "10 years experience",
    "typeOfEvents": "All types",
    "whyHost": "Admin approved"
  }'
```

---

## Error Handling

### 404 - Not Found
```json
{
  "statusCode": 404,
  "success": false,
  "message": "User not found!"
}
```

### 400 - Bad Request
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Only USER role can request to become HOST!"
}
```

### 400 - Duplicate Request
```json
{
  "statusCode": 400,
  "success": false,
  "message": "You have already submitted a request!"
}
```

### 403 - Forbidden
```json
{
  "statusCode": 403,
  "success": false,
  "message": "Forbidden!"
}
```

---

## Testing Checklist

- [ ] User with USER role can create request
- [ ] User with HOST role cannot create request
- [ ] User cannot submit duplicate request
- [ ] Admin can view all requests
- [ ] Admin can approve request (role changes to HOST)
- [ ] Admin can create host directly
- [ ] Admin can delete request
- [ ] Approved user can create events
- [ ] Pagination works correctly
- [ ] All validations working

---

## Migration Required

After adding becomeHost model, run:
```bash
npm run migrate
```

This will create the `become_host` table.

---

## Status: ✅ COMPLETE

All CRUD operations implemented with proper role-based access control and validation.
