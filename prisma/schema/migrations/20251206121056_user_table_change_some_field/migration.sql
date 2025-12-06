/*
  Warnings:

  - You are about to drop the column `eventType` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `requiredParticipants` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `reviewCount` on the `users` table. All the data in the column will be lost.
  - Added the required column `eventCategory` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxParticipants` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minParticipants` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `events` table without a default value. This is not possible if the table is not empty.
  - Made the column `eventImage` on table `events` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "EventStatus" ADD VALUE 'CLOSED';

-- AlterTable
ALTER TABLE "events" DROP COLUMN "eventType",
DROP COLUMN "requiredParticipants",
ADD COLUMN     "currentParticipants" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "eventCategory" TEXT NOT NULL,
ADD COLUMN     "maxParticipants" INTEGER NOT NULL,
ADD COLUMN     "minParticipants" INTEGER NOT NULL,
ADD COLUMN     "time" TEXT NOT NULL,
ALTER COLUMN "eventImage" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "rating",
DROP COLUMN "reviewCount",
ADD COLUMN     "hostedEvents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pertcipatedEvents" INTEGER NOT NULL DEFAULT 0;
