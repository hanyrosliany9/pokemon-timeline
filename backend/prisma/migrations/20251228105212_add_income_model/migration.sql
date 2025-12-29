-- CreateTable
CREATE TABLE "income" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "currency" "Currency" NOT NULL,
    "amountUSDT" DECIMAL(20,8) NOT NULL,
    "amountIDR" DECIMAL(20,2) NOT NULL,
    "incomeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "income_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "income_incomeDate_idx" ON "income"("incomeDate");

-- CreateIndex
CREATE INDEX "income_currency_idx" ON "income"("currency");
