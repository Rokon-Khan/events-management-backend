# Stripe Payment Integration Guide

## Overview
Complete Stripe payment integration for event participation with automatic user enrollment and event status management.

---

## Payment Flow

### 1. User Wants to Join Event
User browses events → Selects paid event → Initiates payment

### 2. Backend Creates Payment Intent
- Validates event exists and has joining fee
- Creates payment record in database
- Creates Stripe PaymentIntent
- Returns client secret to frontend

### 3. Frontend Completes Payment
- Uses Stripe.js with client secret
- User enters card details
- Stripe processes payment

### 4. Webhook Confirms Payment
- Stripe sends webhook to backend
- Payment status updated to COMPLETED
- User automatically added to event
- Event participant count incremented
- User's participated events count incremented

---

## API Endpoints

### 1. Create Payment
**POST** `/api/v1/payments/`
**Auth Required:** Yes (USER, HOST)

**Request:**
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
      "transactionId": "TXN-1234567890-abc123",
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
        "joiningFee": 50.00,
        "date": "2024-12-31T00:00:00.000Z",
        "location": "Convention Center"
      }
    },
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "publishableKey": "pk_test_xxx"
  }
}
```

**Features:**
- ✅ Validates event exists
- ✅ Checks if event requires payment (joiningFee > 0)
- ✅ Prevents duplicate payments
- ✅ Creates payment record with PENDING status
- ✅ Creates Stripe PaymentIntent
- ✅ Returns client secret for frontend

---

### 2. Verify Payment
**POST** `/api/v1/payments/verify`
**Auth Required:** Yes (USER, HOST)

**Request:**
```json
{
  "paymentIntentId": "pi_xxx"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Payment verified successfully!",
  "data": {
    "paymentStatus": "succeeded",
    "payment": {
      "id": "payment-uuid",
      "paymentStatus": "COMPLETED",
      "event": {...}
    }
  }
}
```

**Use Case:** Frontend calls this after Stripe confirms payment to sync status.

---

### 3. Stripe Webhook
**POST** `/api/v1/payments/stripe/webhook`
**Auth Required:** No (Stripe signature verification)

**Webhook Events Handled:**
- `payment_intent.succeeded` - Payment successful
- `payment_intent.payment_failed` - Payment failed

**Automatic Actions on Success:**
1. Update payment status to COMPLETED
2. Increment event currentParticipants
3. Increment user pertcipatedEvents
4. Set event status to FULL if max reached

---

## Frontend Integration

### Step 1: Install Stripe.js
```bash
npm install @stripe/stripe-js
```

### Step 2: Create Payment
```javascript
const createPayment = async (eventId) => {
  const response = await fetch('/api/v1/payments/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ eventId })
  });

  const { data } = await response.json();
  return data;
};
```

### Step 3: Complete Payment with Stripe
```javascript
import { loadStripe } from '@stripe/stripe-js';

const handlePayment = async (eventId) => {
  // Step 1: Create payment
  const { clientSecret, publishableKey } = await createPayment(eventId);

  // Step 2: Load Stripe
  const stripe = await loadStripe(publishableKey);

  // Step 3: Confirm payment
  const { error, paymentIntent } = await stripe.confirmCardPayment(
    clientSecret,
    {
      payment_method: {
        card: cardElement, // Stripe Card Element
        billing_details: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      }
    }
  );

  if (error) {
    console.error('Payment failed:', error);
    alert('Payment failed: ' + error.message);
  } else if (paymentIntent.status === 'succeeded') {
    console.log('Payment successful!');
    
    // Step 4: Verify payment (optional but recommended)
    await verifyPayment(paymentIntent.id);
    
    // Redirect to success page
    window.location.href = '/payment/success';
  }
};

const verifyPayment = async (paymentIntentId) => {
  await fetch('/api/v1/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ paymentIntentId })
  });
};
```

### Step 4: Using Stripe Elements (Recommended)
```javascript
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_xxx');

function CheckoutForm({ eventId, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: event.target.name.value,
            email: event.target.email.value,
          },
        },
      }
    );

    if (error) {
      console.error(error);
      alert('Payment failed: ' + error.message);
    } else if (paymentIntent.status === 'succeeded') {
      alert('Payment successful!');
      window.location.href = '/events/' + eventId;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay Now
      </button>
    </form>
  );
}

function PaymentPage({ eventId }) {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    createPayment(eventId).then(data => {
      setClientSecret(data.clientSecret);
    });
  }, [eventId]);

  return (
    <Elements stripe={stripePromise}>
      {clientSecret && (
        <CheckoutForm eventId={eventId} clientSecret={clientSecret} />
      )}
    </Elements>
  );
}
```

---

## Webhook Setup

### 1. Stripe Dashboard Configuration
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://your-domain.com/api/v1/payments/stripe/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy webhook signing secret

### 2. Add to .env
```env
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 3. Test Webhook Locally
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:5000/api/v1/payments/stripe/webhook

# Trigger test event
stripe trigger payment_intent.succeeded
```

---

## Testing

### Test Cards (Stripe Test Mode)

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Payment Declined:**
- Card: `4000 0000 0000 0002`

**Insufficient Funds:**
- Card: `4000 0000 0000 9995`

**3D Secure Required:**
- Card: `4000 0025 0000 3155`

---

## Payment States

### PENDING
- Payment created but not completed
- User has not paid yet
- Can be completed or failed

### COMPLETED
- Payment successful
- User added to event
- Participant count incremented

### FAILED
- Payment attempt failed
- User not added to event
- Can retry payment

### REFUNDED
- Payment was refunded
- User may be removed from event (manual process)

---

## Error Handling

### Event Not Found
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Event not found!"
}
```

### Free Event
```json
{
  "statusCode": 400,
  "success": false,
  "message": "This event is free, no payment required!"
}
```

### Duplicate Payment
```json
{
  "statusCode": 400,
  "success": false,
  "message": "You have already paid for this event!"
}
```

### Stripe Error
```json
{
  "statusCode": 500,
  "success": false,
  "message": "Failed to create payment intent"
}
```

---

## Security Features

✅ **Stripe Signature Verification** - Webhooks verified with signature
✅ **Payment Intent Metadata** - Stores payment ID, user ID, event ID
✅ **Duplicate Prevention** - Checks existing completed payments
✅ **Amount Validation** - Amount taken from event.joiningFee
✅ **User Authorization** - Only authenticated users can create payments
✅ **Transaction Logging** - All payment actions logged with Pino

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

---

## Automatic Actions

### On Payment Success:
1. ✅ Payment status → COMPLETED
2. ✅ Event currentParticipants + 1
3. ✅ User pertcipatedEvents + 1
4. ✅ Event status → FULL (if max reached)

### On Payment Failure:
1. ✅ Payment status → FAILED
2. ✅ User notified (frontend handles)
3. ✅ Can retry payment

---

## Environment Variables

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**Important:** 
- Secret key starts with `sk_`
- Publishable key starts with `pk_`
- Webhook secret starts with `whsec_`

---

## Complete Flow Example

```
1. User clicks "Join Event" ($50 fee)
   ↓
2. Frontend: POST /api/v1/payments/ { eventId }
   ↓
3. Backend: Creates payment record + Stripe PaymentIntent
   ↓
4. Backend: Returns clientSecret
   ↓
5. Frontend: Shows Stripe payment form
   ↓
6. User enters card details
   ↓
7. Stripe processes payment
   ↓
8. Stripe sends webhook to backend
   ↓
9. Backend: Updates payment status to COMPLETED
   ↓
10. Backend: Adds user to event (currentParticipants++)
    ↓
11. Backend: Updates user stats (pertcipatedEvents++)
    ↓
12. Frontend: Shows success message
    ↓
13. User can now access event
```

---

## Troubleshooting

### Webhook Not Receiving Events
- Check webhook URL is publicly accessible
- Verify webhook secret in .env
- Check Stripe dashboard for webhook delivery logs
- Use Stripe CLI for local testing

### Payment Intent Creation Fails
- Verify Stripe secret key is correct
- Check amount is positive number
- Ensure event exists and has joiningFee > 0

### Payment Completed But User Not Added
- Check webhook is configured correctly
- Verify payment metadata contains paymentId
- Check server logs for errors
- Manually verify payment with /verify endpoint

---

## Status: ✅ COMPLETE

Full Stripe payment integration implemented with:
- Payment creation
- Stripe PaymentIntent
- Webhook handling
- Automatic user enrollment
- Payment verification
- Error handling
- Security features
