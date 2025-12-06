-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'HOST');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('OPEN', 'FULL', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventImage" TEXT,
    "eventType" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "requiredParticipants" INTEGER NOT NULL DEFAULT 0,
    "joiningFee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "EventStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpLog" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "success" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "profilePhoto" TEXT,
    "address" TEXT,
    "bio" TEXT,
    "interests" TEXT[],
    "gender" "Gender",
    "dateOfBirth" TIMESTAMP(3),
    "rating" DOUBLE PRECISION DEFAULT 4.5,
    "reviewCount" INTEGER DEFAULT 0,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
