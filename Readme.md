# Event Management System

A comprehensive event management platform built with Node.js, Express, Prisma, and PostgreSQL. This system allows users to create, manage, and participate in events with integrated payment processing, reviews, and role-based access control.

## 🚀 Features

### Authentication & Authorization
- ✅ User registration with email OTP verification
- ✅ JWT-based authentication
- ✅ Role-based access control (USER, HOST, ADMIN)
- ✅ Password reset with OTP
- ✅ Secure password hashing with bcrypt

### User Management
- ✅ User profile management
- ✅ Profile photo upload (Cloudinary)
- ✅ User interests and bio
- ✅ Admin user management
- ✅ User status control (ACTIVE, INACTIVE, BLOCKED)

### Event Management
- ✅ Create, read, update, delete events
- ✅ Event image upload (Cloudinary)
- ✅ Event categories and search
- ✅ Event status management (OPEN, FULL, ONGOING, COMPLETED, CANCELLED, CLOSED)
- ✅ Automatic event closure after date/time
- ✅ Participant management
- ✅ Min/max participant limits
- ✅ Event joining fees

### Review System
- ✅ Users can review event hosts
- ✅ Rating system (0-5)
- ✅ One review per event per user
- ✅ Host statistics (average rating, total reviews)
- ✅ Prevent self-reviews
- ✅ Admin moderation

### Payment Integration
- ✅ Stripe payment integration
- ✅ Automatic payment amount from event fees
- ✅ Payment status tracking
- ✅ Admin payment management
- ✅ Host can view their event payments
- ✅ Webhook integration

### Additional Features
- ✅ Pagination and filtering
- ✅ Search functionality
- ✅ File upload to Cloudinary
- ✅ Email notifications (OTP)
- ✅ Automatic counters (participated events, hosted events, reviews)
- ✅ Redis caching for OTP
- ✅ Comprehensive error handling

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT, bcrypt
- **Payment:** Stripe
- **File Upload:** Cloudinary
- **Email:** Nodemailer
- **Caching:** Redis
- **Validation:** Zod
- **Language:** TypeScript

---

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (optional, for OTP caching)
- Stripe account
- Cloudinary account

---

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd event-management-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/event_management"

# JWT
JWT_ACCESS_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
SALT_ROUND=10

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Client URL
CLIENT_URL=http://localhost:3000
```

### 4. Database Setup
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run migrate

# (Optional) Seed database
npm run seed
```

### 5. Start the server
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Server will run on `http://localhost:5000`

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### API Endpoints

#### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/registration` | Register new user | No |
| POST | `/auth/verify-email` | Verify email with OTP | No |
| POST | `/auth/login` | User login | No |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/logout` | Logout user | Yes |
| POST | `/auth/change-password` | Change password | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with OTP | No |
| POST | `/auth/resend-otp` | Resend OTP | No |

#### User Management
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/user` | Get all users | Yes | ADMIN |
| GET | `/user/me` | Get my profile | Yes | All |
| GET | `/user/:id` | Get user by ID | Yes | ADMIN |
| PATCH | `/user/update-my-profile` | Update profile | Yes | All |
| PATCH | `/user/:id/status` | Change user status | Yes | ADMIN |

#### Event Management
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/event` | Create event | Yes | ADMIN, HOST |
| GET | `/event` | Get all events | No | Public |
| GET | `/event/:id` | Get event by ID | No | Public |
| PATCH | `/event/:id` | Update event | Yes | ADMIN, HOST (owner) |
| DELETE | `/event/:id` | Delete event | Yes | ADMIN |
| POST | `/event/:id/participate` | Participate in event | Yes | USER, HOST |

#### Review System
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/review` | Create review | Yes | USER, HOST, ADMIN |
| GET | `/review` | Get all reviews | No | Public |
| GET | `/review/:id` | Get review by ID | No | Public |
| GET | `/review/host/:hostId/stats` | Get host statistics | No | Public |
| PATCH | `/review/:id` | Update review | Yes | Owner, ADMIN |
| DELETE | `/review/:id` | Delete review | Yes | ADMIN |

#### Payment Management
| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/payments` | Create payment | Yes | USER, HOST |
| GET | `/payments` | Get all payments | Yes | ADMIN, HOST |
| GET | `/payments/:id` | Get payment by ID | Yes | ADMIN, HOST |
| PATCH | `/payments/:id/status` | Update payment status | Yes | ADMIN |
| DELETE | `/payments/:id` | Delete payment | Yes | ADMIN |
| POST | `/payments/stripe/webhook` | Stripe webhook | No | Webhook |

---

## 🔐 User Roles

### USER
- Register and manage profile
- Participate in events
- Make payments
- Review event hosts
- View public content

### HOST
- All USER permissions
- Create and manage own events
- View payments for own events
- Cannot review own events

### ADMIN
- Full system access
- Manage all users
- Manage all events
- Manage all reviews
- Manage all payments
- Change user status
- Delete any content

---

## 📊 Database Schema

### User
- id, email, fullName, password
- phoneNumber, profilePhoto, address, bio
- interests (array), gender, dateOfBirth
- pertcipatedEvents, hostedEvents, reviewCount
- role, status, isEmailVerified, isDeleted

### Event
- id, title, description, eventImage
- eventCategory, date, time, location
- minParticipants, maxParticipants, currentParticipants
- joiningFee, status
- userId (host)

### Review
- id, rating, comment, reviewCount
- userId, eventId

### Payment
- id, amount, paymentMethod, paymentStatus
- transactionId
- userId, eventId

---

## 🎯 Key Features Explained

### Automatic Event Status Management
Events automatically close when their date/time passes. A scheduler runs every 60 seconds to update event statuses.

### Review System
- Users can review event hosts only once per event
- Hosts cannot review their own events
- Rating must be between 0-5
- Automatic reviewCount increment for hosts

### Payment Flow
1. User creates payment for an event
2. System generates Stripe PaymentIntent
3. Frontend completes payment with Stripe
4. Webhook confirms payment
5. Payment status updated automatically

### File Upload
- Profile photos and event images uploaded to Cloudinary
- Automatic old image deletion
- Secure URL generation

---

## 🧪 Testing

### Import Postman Collection
1. Open Postman
2. Click Import
3. Select `EVENT_MANAGEMENT_API.json`
4. Set `baseUrl` variable to `http://localhost:5000/api/v1`
5. After login, set `token` variable with received JWT

### Test Flow
1. Register user → Verify email → Login
2. Update profile with details
3. Create event (as HOST)
4. Participate in event (as USER)
5. Create payment for event
6. Review event host
7. View host statistics

---

## 📁 Project Structure

```
event-management-backend/
├── prisma/
│   └── schema/
│       ├── user.prisma
│       ├── event.prisma
│       ├── review.prisma
│       ├── payment.prisma
│       ├── otp.prisma
│       └── enum.prisma
├── src/
│   ├── app/
│   │   ├── errors/
│   │   ├── helpers/
│   │   ├── interfaces/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   ├── event/
│   │   │   ├── review/
│   │   │   ├── payments/
│   │   │   ├── stripe/
│   │   │   └── otp/
│   │   ├── routes/
│   │   ├── shared/
│   │   └── utils/
│   ├── config/
│   ├── app.ts
│   └── server.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- HTTP-only cookies
- Role-based access control
- OTP expiration (5 minutes)
- Email verification required
- Stripe secure payment
- Input validation with Zod
- SQL injection prevention (Prisma)

---

## 🚀 Deployment

### Environment Variables
Ensure all production environment variables are set:
- Use production database URL
- Use strong JWT secrets
- Enable HTTPS
- Set NODE_ENV=production
- Configure CORS for production domain

### Build
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

---

## 📝 API Response Format

### Success Response
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Error message",
  "errorDetails": {...}
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Md Rokonuzzaman**

---

## 📞 Support

For support, email support@eventmanagement.com or open an issue in the repository.

---

## 🎉 Acknowledgments

- Express.js for the web framework
- Prisma for the amazing ORM
- Stripe for payment processing
- Cloudinary for file storage
- All contributors and supporters

---

## 📚 Additional Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Registration Flow](./REGISTRATION_FLOW.md)
- [Review Module](./REVIEW_MODULE_DOCUMENTATION.md)
- [Payment Module](./PAYMENT_MODULE_DOCUMENTATION.md)
- [Postman Collection](./EVENT_MANAGEMENT_API.json)

---

**Happy Coding! 🚀**
