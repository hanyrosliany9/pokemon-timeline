/*
  Warnings:

  - You are about to drop the column `category` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `timelineEventId` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the `daily_progress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `timeline_events` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `expenses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "daily_progress" DROP CONSTRAINT "daily_progress_timelineEventId_fkey";

-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_timelineEventId_fkey";

-- DropForeignKey
ALTER TABLE "timeline_events" DROP CONSTRAINT "timeline_events_parentId_fkey";

-- DropIndex
DROP INDEX "expenses_category_idx";

-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "category",
DROP COLUMN "timelineEventId",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "projectId" TEXT;

-- DropTable
DROP TABLE "daily_progress";

-- DropTable
DROP TABLE "timeline_events";

-- DropEnum
DROP TYPE "EventStatus";

-- DropEnum
DROP TYPE "EventType";

-- DropEnum
DROP TYPE "ExpenseCategory";

-- CreateTable
CREATE TABLE "card_projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "goalTotal" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_entries" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "cardsAdded" INTEGER NOT NULL,
    "cumulativeTotal" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "card_projects_createdAt_idx" ON "card_projects"("createdAt");

-- CreateIndex
CREATE INDEX "card_entries_projectId_idx" ON "card_entries"("projectId");

-- CreateIndex
CREATE INDEX "card_entries_date_idx" ON "card_entries"("date");

-- CreateIndex
CREATE UNIQUE INDEX "card_entries_projectId_date_key" ON "card_entries"("projectId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "expenses_categoryId_idx" ON "expenses"("categoryId");

-- AddForeignKey
ALTER TABLE "card_entries" ADD CONSTRAINT "card_entries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "card_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "card_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
