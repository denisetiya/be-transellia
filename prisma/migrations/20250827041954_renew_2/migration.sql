/*
  Warnings:

  - You are about to drop the column `userId` on the `SubscriptionProduct` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."SubscriptionProduct" DROP CONSTRAINT "SubscriptionProduct_userId_fkey";

-- DropIndex
DROP INDEX "public"."SubscriptionProduct_userId_key";

-- AlterTable
ALTER TABLE "public"."SubscriptionProduct" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "subscriptionId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."SubscriptionProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
