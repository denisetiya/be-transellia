-- CreateTable
CREATE TABLE "public"."PaymentHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "transactionTime" TIMESTAMP(3),
    "expiryTime" TIMESTAMP(3),
    "vaNumber" TEXT,
    "bank" TEXT,
    "qrCode" TEXT,
    "redirectUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentHistory_orderId_key" ON "public"."PaymentHistory"("orderId");

-- AddForeignKey
ALTER TABLE "public"."PaymentHistory" ADD CONSTRAINT "PaymentHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentHistory" ADD CONSTRAINT "PaymentHistory_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."SubscriptionList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
