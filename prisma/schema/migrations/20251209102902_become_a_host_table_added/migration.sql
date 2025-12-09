-- CreateTable
CREATE TABLE "become_host" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hostExperience" TEXT NOT NULL,
    "typeOfEvents" TEXT NOT NULL,
    "whyHost" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "become_host_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "become_host_userId_key" ON "become_host"("userId");

-- AddForeignKey
ALTER TABLE "become_host" ADD CONSTRAINT "become_host_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
