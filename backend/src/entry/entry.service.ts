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
 * Handles logging card progress with automatic cumulative calculation
 *
 * Key feature: When you add/update/delete an entry, all subsequent
 * entries are automatically recalculated to maintain correct running totals.
 */
@Injectable()
export class EntryService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * Create a card entry with automatic cumulative calculation
   */
  async create(dto: CreateEntryDto): Promise<CardEntry> {
    // Validate project exists
    const project = await this.prisma.cardProject.findUnique({
      where: { id: dto.projectId },
    })

    if (!project) {
      throw new NotFoundException(`Project ${dto.projectId} not found`)
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

    // Get previous entry to calculate cumulative
    const previousEntry = await this.prisma.cardEntry.findFirst({
      where: {
        projectId: dto.projectId,
        date: { lt: entryDate },
      },
      orderBy: { date: 'desc' },
    })

    const cumulativeTotal = (previousEntry?.cumulativeTotal || 0) + dto.cardsAdded

    // Use transaction for atomicity
    const entry = await this.prisma.$transaction(async (tx) => {
      // Upsert entry (one per day per project)
      const newEntry = await tx.cardEntry.upsert({
        where: {
          projectId_date: {
            projectId: dto.projectId,
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
          projectId: dto.projectId,
          date: entryDate,
          cardsAdded: dto.cardsAdded,
          cumulativeTotal,
          notes: dto.notes,
        },
      })

      // Recalculate all subsequent entries
      await this.recalculateSubsequentEntries(tx, dto.projectId, entryDate)

      // Update project progress percentage
      const latestEntry = await tx.cardEntry.findFirst({
        where: { projectId: dto.projectId },
        orderBy: { date: 'desc' },
      })

      if (latestEntry) {
        const progress = Math.min(
          100,
          Math.round((latestEntry.cumulativeTotal / project.goalTotal) * 100),
        )
        await tx.cardProject.update({
          where: { id: dto.projectId },
          data: { progress },
        })
      }

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

    const project = await this.prisma.cardProject.findUnique({
      where: { id: entry.projectId },
    })

    if (!project) {
      throw new BadRequestException('Associated project not found')
    }

    const cardsAdded = dto.cardsAdded ?? entry.cardsAdded

    if (cardsAdded <= 0) {
      throw new BadRequestException('Cards added must be greater than 0')
    }

    // Get previous entry to recalculate cumulative
    const previousEntry = await this.prisma.cardEntry.findFirst({
      where: {
        projectId: entry.projectId,
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

      // Recalculate all subsequent entries
      await this.recalculateSubsequentEntries(tx, entry.projectId, entry.date)

      // Update project progress percentage
      const latestEntry = await tx.cardEntry.findFirst({
        where: { projectId: entry.projectId },
        orderBy: { date: 'desc' },
      })

      if (latestEntry) {
        const progress = Math.min(
          100,
          Math.round((latestEntry.cumulativeTotal / project.goalTotal) * 100),
        )
        await tx.cardProject.update({
          where: { id: entry.projectId },
          data: { progress },
        })
      }

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

    const project = await this.prisma.cardProject.findUnique({
      where: { id: entry.projectId },
    })

    if (!project) {
      throw new BadRequestException('Associated project not found')
    }

    // Use transaction for atomic deletion
    const deletedEntry = await this.prisma.$transaction(async (tx) => {
      const result = await tx.cardEntry.delete({ where: { id } })

      // Recalculate all subsequent entries
      await this.recalculateSubsequentEntries(tx, entry.projectId, entry.date)

      // Update project progress percentage
      const latestEntry = await tx.cardEntry.findFirst({
        where: { projectId: entry.projectId },
        orderBy: { date: 'desc' },
      })

      const progress = latestEntry
        ? Math.min(100, Math.round((latestEntry.cumulativeTotal / project.goalTotal) * 100))
        : 0

      await tx.cardProject.update({
        where: { id: entry.projectId },
        data: { progress },
      })

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
   * Find all entries for a project
   */
  async findByProject(projectId: string): Promise<CardEntry[]> {
    const entries = await this.prisma.cardEntry.findMany({
      where: { projectId },
      orderBy: { date: 'desc' },
    })

    return entries.map((e) => this.formatEntry(e))
  }

  /**
   * Get statistics for a project
   */
  async getStats(projectId: string): Promise<ProjectStats> {
    const project = await this.prisma.cardProject.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`)
    }

    const entries = await this.prisma.cardEntry.findMany({
      where: { projectId },
      orderBy: { date: 'asc' },
    })

    if (entries.length === 0) {
      return {
        totalProcessed: 0,
        goalTotal: project.goalTotal,
        remaining: project.goalTotal,
        percentComplete: 0,
        averageDaily: 0,
        daysWorked: 0,
      }
    }

    const lastDate = new Date(entries[entries.length - 1].date)
    const totalProcessed = entries[entries.length - 1].cumulativeTotal
    const remaining = Math.max(0, project.goalTotal - totalProcessed)
    const percentComplete = Math.round((totalProcessed / project.goalTotal) * 100)

    const daysWorked = entries.length
    const averageDaily = Math.round(totalProcessed / daysWorked)

    // Calculate estimated completion date
    let estimatedCompletionDate: string | undefined = undefined
    if (averageDaily > 0 && remaining > 0) {
      const daysRemaining = Math.ceil(remaining / averageDaily)
      const completionDate = new Date(lastDate)
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
   * Private: Recalculate all entries after a given date
   */
  private async recalculateSubsequentEntries(
    tx: any,
    projectId: string,
    afterDate: Date,
  ): Promise<void> {
    const subsequentEntries = await tx.cardEntry.findMany({
      where: {
        projectId,
        date: { gt: afterDate },
      },
      orderBy: { date: 'asc' },
    })

    // Get the cumulative total at the cutoff date
    const cutoffEntry = await tx.cardEntry.findFirst({
      where: {
        projectId,
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
