-- DropForeignKey
ALTER TABLE "public"."Employee" DROP CONSTRAINT "Employee_StoreId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Employee" DROP CONSTRAINT "Employee_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HistorySale" DROP CONSTRAINT "HistorySale_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_StoreId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserDetails" DROP CONSTRAINT "UserDetails_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."UserDetails" ADD CONSTRAINT "UserDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_StoreId_fkey" FOREIGN KEY ("StoreId") REFERENCES "public"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_StoreId_fkey" FOREIGN KEY ("StoreId") REFERENCES "public"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistorySale" ADD CONSTRAINT "HistorySale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
