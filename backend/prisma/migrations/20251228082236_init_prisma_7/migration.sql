-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('MILESTONE', 'TASK', 'DEADLINE', 'MEETING', 'DELIVERY');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USDT', 'IDR');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('CROPPING', 'MOTION_WORK', 'TOOLS', 'SOFTWARE', 'HARDWARE', 'OUTSOURCING', 'MISCELLANEOUS');

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventType" "EventType" NOT NULL DEFAULT 'TASK',
    "status" "EventStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "currency" "Currency" NOT NULL,
    "amountUSDT" DECIMAL(20,8) NOT NULL,
    "amountIDR" DECIMAL(20,2) NOT NULL,
    "exchangeRateId" TEXT,
    "timelineEventId" TEXT,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "receiptUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" TEXT NOT NULL,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL,
    "rate" DECIMAL(20,8) NOT NULL,
    "provider" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currency_cache" (
    "id" TEXT NOT NULL,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL,
    "rate" DECIMAL(20,8) NOT NULL,
    "provider" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currency_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "timeline_events_status_idx" ON "timeline_events"("status");

-- CreateIndex
CREATE INDEX "timeline_events_startDate_idx" ON "timeline_events"("startDate");

-- CreateIndex
CREATE INDEX "timeline_events_eventType_idx" ON "timeline_events"("eventType");

-- CreateIndex
CREATE INDEX "expenses_category_idx" ON "expenses"("category");

-- CreateIndex
CREATE INDEX "expenses_expenseDate_idx" ON "expenses"("expenseDate");

-- CreateIndex
CREATE INDEX "expenses_currency_idx" ON "expenses"("currency");

-- CreateIndex
CREATE INDEX "exchange_rates_fromCurrency_toCurrency_idx" ON "exchange_rates"("fromCurrency", "toCurrency");

-- CreateIndex
CREATE INDEX "exchange_rates_timestamp_idx" ON "exchange_rates"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_fromCurrency_toCurrency_timestamp_key" ON "exchange_rates"("fromCurrency", "toCurrency", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "currency_cache_fromCurrency_toCurrency_key" ON "currency_cache"("fromCurrency", "toCurrency");

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "timeline_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_exchangeRateId_fkey" FOREIGN KEY ("exchangeRateId") REFERENCES "exchange_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_timelineEventId_fkey" FOREIGN KEY ("timelineEventId") REFERENCES "timeline_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
