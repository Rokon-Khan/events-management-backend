# Updated Registration Flow

## Overview
Simplified single-step registration with automatic OTP sending and optional role selection.

## Registration Process

### Step 1: Register User
**POST** `/api/auth/registration`

**Request Body:**
```json
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "password": "password123",
  "role": "HOST"
}
```

**Field Details:**
- `email` - Required, valid email format
- `fullName` - Required, minimum 1 character
- `password` - Required, minimum 6 characters
- `role` - Optional, defaults to "USER"
  - Available values: "USER", "HOST", "ADMIN"

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Registration successful! Please verify your email.",
  "data": {
    "message": "Registration successful! OTP sent to your email for verification."
  }
}
```

**What Happens:**
1. User account is created immediately
2. Password is hashed and stored
3. Role is set (defaults to "USER" if not provided)
4. OTP is generated and sent to email
5. User can login but email verification is required for full access

---

### Step 2: Verify Email
**POST** `/api/auth/verify-email`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Email verified successfully!",
  "data": {
    "message": "Email verified successfully!"
  }
}
```

**What Happens:**
1. OTP is validated (expires in 5 minutes)
2. User's `isEmailVerified` is set to true
3. User can now fully access the system

---

## Example Usage

### Register as Regular User (Default)
```bash
curl -X POST http://localhost:5000/api/auth/registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "fullName": "John Doe",
    "password": "securepass123"
  }'
```
Result: User registered with role "USER"

---

### Register as Event Host
```bash
curl -X POST http://localhost:5000/api/auth/registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "host@example.com",
    "fullName": "Jane Host",
    "password": "securepass123",
    "role": "HOST"
  }'
```
Result: User registered with role "HOST"

---

### Verify Email
```bash
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

---

## Login After Registration

**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Note:** User can login even before email verification, but `isEmailVerified` will be false.

---

## Resend OTP

If user didn't receive OTP or it expired:

**POST** `/api/auth/resend-otp`
```json
{
  "email": "user@example.com",
  "purpose": "email_verification"
}
```

---

## Changes from Previous Flow

### Before (3-step process):
1. POST `/api/auth/initiate-registration` - Send email only
2. POST `/api/auth/verify-registration-email` - Verify OTP
3. POST `/api/auth/complete-registration` - Create user with details

### After (2-step process):
1. POST `/api/auth/registration` - Create user + send OTP
2. POST `/api/auth/verify-email` - Verify OTP

### Benefits:
✅ Simpler flow (2 steps instead of 3)
✅ User account created immediately
✅ Optional role selection during registration
✅ Automatic role default to "USER"
✅ Cleaner API endpoints
✅ Better user experience

---

## Validation Rules

### Email
- Must be valid email format
- Must be unique (no duplicates)

### Full Name
- Required
- Minimum 1 character

### Password
- Required
- Minimum 6 characters
- Hashed using bcrypt

### Role
- Optional
- Must be one of: "USER", "HOST", "ADMIN"
- Defaults to "USER" if not provided

---

## Error Responses

### User Already Exists
```json
{
  "statusCode": 400,
  "success": false,
  "message": "User already exists!"
}
```

### Invalid OTP
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Invalid or expired OTP!"
}
```

### User Not Found (during verification)
```json
{
  "statusCode": 404,
  "success": false,
  "message": "User not found!"
}
```

---

## Security Features

✅ Password hashing with bcrypt
✅ OTP expires in 5 minutes
✅ Email uniqueness validation
✅ Role validation
✅ Secure token-based authentication
✅ HTTP-only cookies for tokens

---

## Complete Registration Example

```javascript
// Step 1: Register
const registerResponse = await fetch('/api/auth/registration', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    fullName: 'John Doe',
    password: 'password123',
    role: 'HOST' // Optional
  })
});

// User receives OTP via email

// Step 2: Verify Email
const verifyResponse = await fetch('/api/auth/verify-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    otp: '123456'
  })
});

// Step 3: Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

// User is now fully authenticated
```

---

## Status: ✅ IMPLEMENTED

All changes have been applied to:
- auth.service.ts
- auth.controller.ts
- auth.validation.ts
- auth.routes.ts
- API_DOCUMENTATION.md
