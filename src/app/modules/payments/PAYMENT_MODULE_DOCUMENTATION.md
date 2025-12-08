# Payment Module Documentation

## Overview
Stripe-only payment integration for event participation with role-based access control.

## Payment Flow

### 1. User Initiates Payment
User wants to join an event → Creates payment → Receives Stripe client secret → Completes payment on frontend

### 2. Payment Verification
Stripe webhook confirms payment → Payment status updated → User can participate in event

---

## API Endpoints

### 1. Create Payment
**POST** `/api/payments/`
**Auth Required:** Yes (USER, HOST)

**Request Body:**
```json
{
  "eventId": "event-uuid-here"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Payment initiated successfully!",
  "data": {
    "payment": {
      "id": "payment-uuid",
      "amount": 50.00,
      "paymentMethod": "STRIPE",
      "paymentStatus": "PENDING",
      "transactionId": "STRIPE-1234567890-abc123",
      "userId": "user-uuid",
      "eventId": "event-uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "event": {
        "id": "event-uuid",
        "title": "Tech Conference 2024",
        "joiningFee": 50.00
      }
    },
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx"
  }
}
```

**What Happens:**
1. Validates event exists
2. Creates payment record with PENDING status
3. Creates Stripe PaymentIntent
4. Returns client secret for frontend payment completion
5. Amount is automatically taken from event.joiningFee

---

### 2. Get All Payments
**GET** `/api/payments/`
**Auth Required:** Yes (ADMIN, HOST)

**Query Parameters:**
- `eventId` - Filter by event
- `userId` - Filter by user
- `paymentStatus` - Filter by status (PENDING, COMPLETED, FAILED, REFUNDED)
- `page` - Page number
- `limit` - Items per page
- `sortBy` - Sort field
- `sortOrder` - asc/desc

**Authorization Rules:**
- **ADMIN**: Can see all payments
- **HOST**: Can only see payments for their own events

**Example:**
```
GET /api/payments/?eventId=event-uuid&paymentStatus=COMPLETED&page=1&limit=10
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Payments retrieved successfully!",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25
  },
  "data": [
    {
      "id": "payment-uuid",
      "amount": 50.00,
      "paymentMethod": "STRIPE",
      "paymentStatus": "COMPLETED",
      "transactionId": "STRIPE-1234567890-abc123",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "event": {
        "id": "event-uuid",
        "title": "Tech Conference 2024",
        "joiningFee": 50.00
      }
    }
  ]
}
```

---

### 3. Get Payment by ID
**GET** `/api/payments/:id`
**Auth Required:** Yes (ADMIN, HOST)

**Authorization Rules:**
- **ADMIN**: Can view any payment
- **HOST**: Can only view payments for their own events

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Payment retrieved successfully!",
  "data": {
    "id": "payment-uuid",
    "amount": 50.00,
    "paymentMethod": "STRIPE",
    "paymentStatus": "COMPLETED",
    "transactionId": "STRIPE-1234567890-abc123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "event": {
      "id": "event-uuid",
      "title": "Tech Conference 2024",
      "joiningFee": 50.00,
      "userId": "host-uuid"
    }
  }
}
```

**Error Cases:**
- 404: Payment not found
- 403: Host trying to view payment for another host's event

---

### 4. Update Payment Status
**PATCH** `/api/payments/:id/status`
**Auth Required:** Yes (ADMIN only)

**Request Body:**
```json
{
  "paymentStatus": "COMPLETED"
}
```

**Available Statuses:**
- `PENDING` - Payment initiated but not completed
- `COMPLETED` - Payment successful
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Payment status updated successfully!",
  "data": {
    "id": "payment-uuid",
    "amount": 50.00,
    "paymentStatus": "COMPLETED",
    "transactionId": "STRIPE-1234567890-abc123",
    "user": {...},
    "event": {...}
  }
}
```

**Use Cases:**
- Manual payment verification
- Refund processing
- Failed payment marking

---

### 5. Delete Payment
**DELETE** `/api/payments/:id`
**Auth Required:** Yes (ADMIN only)

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Payment deleted successfully!",
  "data": {
    "message": "Payment deleted successfully!"
  }
}
```

**Error Cases:**
- 404: Payment not found

---

### 6. Stripe Webhook
**POST** `/api/payments/stripe/webhook`
**Auth Required:** No (Stripe signature verification)

**Purpose:** Automatically update payment status when Stripe confirms payment

**Webhook Events:**
- `payment_intent.succeeded` - Payment successful
- `payment_intent.payment_failed` - Payment failed

**Configuration:**
1. Set up webhook in Stripe Dashboard
2. Point to: `https://your-domain.com/api/payments/stripe/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

---

## Database Schema

### Payment Model
```prisma
model Payment {
    id            String        @id @default(uuid())
    amount        Float
    paymentMethod paymentMethod @default(STRIPE)
    paymentStatus PaymentStatus @default(PENDING)
    transactionId String?
    createdAt     DateTime      @default(now())
    updatedAt     DateTime      @updatedAt
    userId        String
    eventId       String
    user          User          @relation(fields: [userId], references: [id])
    event         Event         @relation(fields: [eventId], references: [id])
    @@map("payments")
}
```

### Enums
```prisma
enum paymentMethod {
    CREDIT_CARD
    DEBIT_CARD
    STRIPE
    BANK_TRANSFER
    CASH
}

enum PaymentStatus {
    PENDING
    COMPLETED
    FAILED
    REFUNDED
}
```

---

## Role-Based Access Control

### USER Role
- ✅ Create payment for events
- ❌ View all payments
- ❌ Update payment status
- ❌ Delete payments

### HOST Role
- ✅ Create payment for events
- ✅ View payments for their own events only
- ❌ Update payment status
- ❌ Delete payments

### ADMIN Role
- ✅ View all payments
- ✅ Update payment status
- ✅ Delete payments
- ✅ Full access to payment management

---

## Frontend Integration

### Step 1: Create Payment
```javascript
const response = await fetch('/api/payments/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    eventId: 'event-uuid'
  })
});

const { data } = await response.json();
const { clientSecret, payment } = data;
```

### Step 2: Complete Payment with Stripe
```javascript
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe('pk_test_xxx');

const { error, paymentIntent } = await stripe.confirmCardPayment(
  clientSecret,
  {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    }
  }
);

if (error) {
  console.error('Payment failed:', error);
} else if (paymentIntent.status === 'succeeded') {
  console.log('Payment successful!');
  // Redirect to success page
}
```

---

## Stripe Configuration

### Environment Variables
```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Webhook Setup
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/payments/stripe/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook signing secret to `.env`

---

## Features Implemented

✅ Stripe-only payment integration
✅ Automatic payment amount from event.joiningFee
✅ Role-based access control
✅ Admin can view all payments
✅ Host can view only their event payments
✅ Admin can update payment status
✅ Admin can delete payments
✅ Stripe webhook integration
✅ Transaction ID generation
✅ Payment filtering and pagination
✅ Secure payment intent creation

---

## Removed Features

❌ SSLCommerz integration (removed)
❌ Multiple payment method selection (Stripe only)
❌ Booking system (simplified to direct event payment)

---

## Error Handling

### Common Errors

**404 - Event Not Found**
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Event not found!"
}
```

**403 - Forbidden**
```json
{
  "statusCode": 403,
  "success": false,
  "message": "You can only view payments for your events!"
}
```

**400 - Invalid Payment Intent**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Invalid payment intent metadata"
}
```

---

## Testing

### Test Payment Creation
```bash
curl -X POST http://localhost:5000/api/payments/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"eventId": "event-uuid"}'
```

### Test Get All Payments (Admin)
```bash
curl -X GET http://localhost:5000/api/payments/ \
  -H "Authorization: Bearer <admin-token>"
```

### Test Get Host Payments
```bash
curl -X GET http://localhost:5000/api/payments/?eventId=event-uuid \
  -H "Authorization: Bearer <host-token>"
```

### Test Update Payment Status (Admin)
```bash
curl -X PATCH http://localhost:5000/api/payments/payment-uuid/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"paymentStatus": "COMPLETED"}'
```

### Test Delete Payment (Admin)
```bash
curl -X DELETE http://localhost:5000/api/payments/payment-uuid \
  -H "Authorization: Bearer <admin-token>"
```

---

## Status: ✅ COMPLETE

All payment module features implemented with Stripe-only integration and proper role-based access control.
