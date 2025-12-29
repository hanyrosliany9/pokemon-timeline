-- AlterTable
ALTER TABLE "timeline_events" ADD COLUMN     "goalTotal" INTEGER;

-- CreateTable
CREATE TABLE "daily_progress" (
    "id" TEXT NOT NULL,
    "timelineEventId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "cardsProcessed" INTEGER NOT NULL,
    "cumulativeTotal" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_progress_timelineEventId_idx" ON "daily_progress"("timelineEventId");

-- CreateIndex
CREATE INDEX "daily_progress_date_idx" ON "daily_progress"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_progress_timelineEventId_date_key" ON "daily_progress"("timelineEventId", "date");

-- AddForeignKey
ALTER TABLE "daily_progress" ADD CONSTRAINT "daily_progress_timelineEventId_fkey" FOREIGN KEY ("timelineEventId") REFERENCES "timeline_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
