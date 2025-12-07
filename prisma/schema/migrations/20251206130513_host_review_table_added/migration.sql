-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "comment" TEXT,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
