import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { RedisService } from '../redis/redis.service'
import { CreateEntryDto } from './dto/create-entry.dto'
import { UpdateEntryDto } from './dto/update-entry.dto'
import {
  CardEntry,
  ProjectStats,
  getTodayUTC7,
  isFutureDateUTC7,
  parseAsUTC7,
} from '@pokemon-timeline/shared'

/**
 * Card Entry Service
 * Handles logging card progress at the BATCH level.
 *
 * Key changes:
 * - Entries are linked to batches (not directly to projects)
 * - Cumulative totals are calculated per batch
 * - Project progress is aggregated from all batch entries
 */
@Injectable()
export class EntryService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * Create a card entry for a batch with automatic cumulative calculation
   */
  async create(dto: CreateEntryDto): Promise<CardEntry> {
    // Validate batch exists and get project info
    const batch = await this.prisma.renderingBatch.findUnique({
      where: { id: dto.batchId },
      include: { project: true },
    })

    if (!batch) {
      throw new NotFoundException(`Batch ${dto.batchId} not found`)
    }

    // Validate date using UTC+7 timezone utilities
    if (isFutureDateUTC7(dto.date)) {
      throw new BadRequestException(
        `Cannot create entry for future dates (today in UTC+7 is ${getTodayUTC7()})`,
      )
    }

    // Parse date as UTC+7
    const entryDate = parseAsUTC7(dto.date)

    if (dto.cardsAdded <= 0) {
      throw new BadRequestException('Cards added must be greater than 0')
    }

    // Get previous entry for THIS BATCH to calculate cumulative
    const previousEntry = await this.prisma.cardEntry.findFirst({
      where: {
        batchId: dto.batchId,
        date: { lt: entryDate },
      },
      orderBy: { date: 'desc' },
    })

    const cumulativeTotal = (previousEntry?.cumulativeTotal || 0) + dto.cardsAdded

    // Use transaction for atomicity
    const entry = await this.prisma.$transaction(async (tx) => {
      // Upsert entry (one per day per batch)
      const newEntry = await tx.cardEntry.upsert({
        where: {
          batchId_date: {
            batchId: dto.batchId,
            date: entryDate,
          },
        },
        update: {
          cardsAdded: dto.cardsAdded,
          cumulativeTotal,
          notes: dto.notes,
          updatedAt: new Date(),
        },
        create: {
          projectId: batch.projectId,
          batchId: dto.batchId,
          date: entryDate,
          cardsAdded: dto.cardsAdded,
          cumulativeTotal,
          notes: dto.notes,
        },
      })

      // Recalculate all subsequent entries for this batch
      await this.recalculateSubsequentEntries(tx, dto.batchId, entryDate)

      // Update project progress (aggregate from all batches)
      await this.updateProjectProgress(tx, batch.projectId)

      return newEntry
    })

    // Publish to Redis for real-time sync
    await this.redis.publish('entry:created', {
      entry: this.formatEntry(entry),
      action: 'create',
    })

    return this.formatEntry(entry)
  }

  /**
   * Update a card entry and recalculate cumulative totals
   */
  async update(id: string, dto: UpdateEntryDto): Promise<CardEntry> {
    const entry = await this.prisma.cardEntry.findUnique({ where: { id } })

    if (!entry) {
      throw new NotFoundException(`Entry ${id} not found`)
    }

    const cardsAdded = dto.cardsAdded ?? entry.cardsAdded

    if (cardsAdded <= 0) {
      throw new BadRequestException('Cards added must be greater than 0')
    }

    // Get previous entry to recalculate cumulative
    const previousEntry = await this.prisma.cardEntry.findFirst({
      where: {
        batchId: entry.batchId,
        date: { lt: entry.date },
      },
      orderBy: { date: 'desc' },
    })

    const cumulativeTotal = (previousEntry?.cumulativeTotal || 0) + cardsAdded

    // Use transaction for atomic update
    const updatedEntry = await this.prisma.$transaction(async (tx) => {
      const result = await tx.cardEntry.update({
        where: { id },
        data: {
          cardsAdded,
          cumulativeTotal,
          notes: dto.notes !== undefined ? dto.notes : entry.notes,
          updatedAt: new Date(),
        },
      })

      // Recalculate all subsequent entries for this batch
      await this.recalculateSubsequentEntries(tx, entry.batchId, entry.date)

      // Update project progress
      await this.updateProjectProgress(tx, entry.projectId)

      return result
    })

    // Publish to Redis
    await this.redis.publish('entry:updated', {
      entry: this.formatEntry(updatedEntry),
      action: 'update',
    })

    return this.formatEntry(updatedEntry)
  }

  /**
   * Delete a card entry and recalculate subsequent entries
   */
  async remove(id: string): Promise<CardEntry> {
    const entry = await this.prisma.cardEntry.findUnique({ where: { id } })

    if (!entry) {
      throw new NotFoundException(`Entry ${id} not found`)
    }

    // Use transaction for atomic deletion
    const deletedEntry = await this.prisma.$transaction(async (tx) => {
      const result = await tx.cardEntry.delete({ where: { id } })

      // Recalculate all subsequent entries for this batch
      await this.recalculateSubsequentEntries(tx, entry.batchId, entry.date)

      // Update project progress
      await this.updateProjectProgress(tx, entry.projectId)

      return result
    })

    // Publish to Redis
    await this.redis.publish('entry:deleted', {
      entry: this.formatEntry(deletedEntry),
      action: 'delete',
    })

    return this.formatEntry(deletedEntry)
  }

  /**
   * Find all entries for a batch
   */
  async findByBatch(batchId: string): Promise<CardEntry[]> {
    const entries = await this.prisma.cardEntry.findMany({
      where: { batchId },
      orderBy: { date: 'desc' },
    })

    return entries.map((e) => this.formatEntry(e))
  }

  /**
   * Find all entries for a project (aggregated from all batches)
   */
  async findByProject(projectId: string): Promise<CardEntry[]> {
    const entries = await this.prisma.cardEntry.findMany({
      where: { projectId },
      orderBy: { date: 'desc' },
    })

    return entries.map((e) => this.formatEntry(e))
  }

  /**
   * Get statistics for a project (aggregated from all batches)
   */
  async getStats(projectId: string): Promise<ProjectStats> {
    const project = await this.prisma.cardProject.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`)
    }

    // Get total cards processed across all batches
    const totalResult = await this.prisma.cardEntry.aggregate({
      where: { projectId },
      _sum: { cardsAdded: true },
    })

    const totalProcessed = totalResult._sum.cardsAdded || 0

    // Get entry count for average calculation
    const entriesCount = await this.prisma.cardEntry.count({
      where: { projectId },
    })

    const remaining = Math.max(0, project.goalTotal - totalProcessed)
    const percentComplete = Math.round((totalProcessed / project.goalTotal) * 100)
    const daysWorked = entriesCount
    const averageDaily = daysWorked > 0 ? Math.round(totalProcessed / daysWorked) : 0

    // Calculate estimated completion date
    let estimatedCompletionDate: string | undefined = undefined
    if (averageDaily > 0 && remaining > 0) {
      const daysRemaining = Math.ceil(remaining / averageDaily)
      const completionDate = new Date()
      completionDate.setDate(completionDate.getDate() + daysRemaining)
      estimatedCompletionDate = completionDate.toISOString().split('T')[0]
    }

    return {
      totalProcessed,
      goalTotal: project.goalTotal,
      remaining,
      percentComplete,
      averageDaily,
      estimatedCompletionDate,
      daysWorked,
    }
  }

  /**
   * Get statistics for a specific batch
   */
  async getBatchStats(batchId: string) {
    const batch = await this.prisma.renderingBatch.findUnique({
      where: { id: batchId },
    })

    if (!batch) {
      throw new NotFoundException(`Batch ${batchId} not found`)
    }

    // Get total cards processed in this batch
    const latestEntry = await this.prisma.cardEntry.findFirst({
      where: { batchId },
      orderBy: { date: 'desc' },
    })

    const totalProcessed = latestEntry?.cumulativeTotal || 0
    const remaining = Math.max(0, batch.cardsCount - totalProcessed)
    const percentComplete = Math.round((totalProcessed / batch.cardsCount) * 100)

    // Get entry count for average calculation
    const entriesCount = await this.prisma.cardEntry.count({
      where: { batchId },
    })

    const averageDaily = entriesCount > 0 ? Math.round(totalProcessed / entriesCount) : 0

    return {
      batchId,
      cardsTarget: batch.cardsCount,
      totalProcessed,
      remaining,
      percentComplete,
      averageDaily,
      daysWorked: entriesCount,
    }
  }

  /**
   * Private: Update project progress based on all batch entries
   */
  private async updateProjectProgress(tx: any, projectId: string): Promise<void> {
    const project = await tx.cardProject.findUnique({
      where: { id: projectId },
    })

    if (!project) return

    // Sum all cards from all batch entries
    const totalResult = await tx.cardEntry.aggregate({
      where: { projectId },
      _sum: { cardsAdded: true },
    })

    const totalProcessed = totalResult._sum.cardsAdded || 0
    const progress = Math.min(100, Math.round((totalProcessed / project.goalTotal) * 100))

    await tx.cardProject.update({
      where: { id: projectId },
      data: { progress },
    })
  }

  /**
   * Private: Recalculate all entries after a given date FOR A BATCH
   */
  private async recalculateSubsequentEntries(
    tx: any,
    batchId: string,
    afterDate: Date,
  ): Promise<void> {
    const subsequentEntries = await tx.cardEntry.findMany({
      where: {
        batchId,
        date: { gt: afterDate },
      },
      orderBy: { date: 'asc' },
    })

    // Get the cumulative total at the cutoff date
    const cutoffEntry = await tx.cardEntry.findFirst({
      where: {
        batchId,
        date: { lte: afterDate },
      },
      orderBy: { date: 'desc' },
    })

    let runningTotal = cutoffEntry?.cumulativeTotal || 0

    // Update each subsequent entry
    for (const entry of subsequentEntries) {
      runningTotal += entry.cardsAdded
      await tx.cardEntry.update({
        where: { id: entry.id },
        data: { cumulativeTotal: runningTotal, updatedAt: new Date() },
      })
    }
  }

  /**
   * Private: Format entry for API response
   */
  private formatEntry(entry: any): CardEntry {
    return {
      ...entry,
      date: entry.date.toISOString().split('T')[0],
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }
  }
}
