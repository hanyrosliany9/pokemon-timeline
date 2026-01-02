import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Decimal } from 'decimal.js'
import { PrismaService } from '@/database/prisma.service'
import { RedisService } from '@/redis/redis.service'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { CardProject } from '@prisma/client'

/**
 * Card Project Service
 * Simplified project tracking - just title and goal total
 */
@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name)

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * Get all card projects
   */
  async findAll(): Promise<CardProject[]> {
    try {
      return await this.prisma.cardProject.findMany({
        orderBy: { createdAt: 'desc' },
        include: { entries: { orderBy: { date: 'desc' }, take: 1 } },
      })
    } catch (error) {
      this.logger.error('Failed to fetch projects:', error)
      throw error
    }
  }

  /**
   * Get a single project by ID with all entries
   */
  async findOne(id: string): Promise<CardProject | null> {
    try {
      return await this.prisma.cardProject.findUnique({
        where: { id },
        include: { entries: { orderBy: { date: 'desc' } } },
      })
    } catch (error) {
      this.logger.error(`Failed to fetch project ${id}:`, error)
      throw error
    }
  }

  /**
   * Create a new card project
   */
  async create(dto: CreateProjectDto): Promise<CardProject> {
    try {
      const project = await this.prisma.cardProject.create({
        data: {
          title: dto.title,
          goalTotal: dto.goalTotal,
          progress: 0,
          pricePerCardUSDT: dto.pricePerCardUSDT
            ? new Decimal(dto.pricePerCardUSDT)
            : null,
        },
      })

      // Publish to Redis for real-time sync
      await this.redis.publish('project:created', {
        project,
        timestamp: new Date().toISOString(),
      })

      this.logger.log(`Project created: ${project.id} - ${project.title}`)
      return project
    } catch (error) {
      this.logger.error('Failed to create project:', error)
      throw error
    }
  }

  /**
   * Update a card project
   */
  async update(id: string, dto: UpdateProjectDto): Promise<CardProject> {
    try {
      const existing = await this.prisma.cardProject.findUnique({ where: { id } })
      if (!existing) {
        throw new NotFoundException(`Project ${id} not found`)
      }

      const project = await this.prisma.cardProject.update({
        where: { id },
        data: {
          title: dto.title,
          goalTotal: dto.goalTotal,
          pricePerCardUSDT: dto.pricePerCardUSDT !== undefined
            ? (dto.pricePerCardUSDT ? new Decimal(dto.pricePerCardUSDT) : null)
            : undefined,
        },
      })

      // If goal changed, recalculate progress percentage
      if (dto.goalTotal && dto.goalTotal !== existing.goalTotal) {
        const latestEntry = await this.prisma.cardEntry.findFirst({
          where: { projectId: id },
          orderBy: { date: 'desc' },
        })

        if (latestEntry) {
          const progress = Math.min(
            100,
            Math.round((latestEntry.cumulativeTotal / dto.goalTotal) * 100),
          )
          await this.prisma.cardProject.update({
            where: { id },
            data: { progress },
          })
        }
      }

      // Publish to Redis
      await this.redis.publish('project:updated', {
        project,
        timestamp: new Date().toISOString(),
      })

      this.logger.log(`Project updated: ${id}`)
      return project
    } catch (error) {
      this.logger.error(`Failed to update project ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete a card project
   */
  async remove(id: string): Promise<CardProject> {
    try {
      const project = await this.prisma.cardProject.delete({
        where: { id },
      })

      // Publish to Redis
      await this.redis.publish('project:deleted', {
        project,
        timestamp: new Date().toISOString(),
      })

      this.logger.log(`Project deleted: ${id}`)
      return project
    } catch (error) {
      this.logger.error(`Failed to delete project ${id}:`, error)
      throw error
    }
  }

  /**
   * Get project statistics
   */
  async getStats(): Promise<{
    totalProjects: number
    completedProjects: number
    inProgressProjects: number
    totalCardsProcessed: number
  }> {
    try {
      const projects = await this.prisma.cardProject.findMany({
        include: { entries: { orderBy: { date: 'desc' }, take: 1 } },
      })

      const totalProjects = projects.length
      const completedProjects = projects.filter((p) => p.progress >= 100).length
      const inProgressProjects = projects.filter((p) => p.progress > 0 && p.progress < 100).length

      const totalCardsProcessed = projects.reduce((sum, p) => {
        const latestEntry = p.entries[0]
        return sum + (latestEntry?.cumulativeTotal || 0)
      }, 0)

      return {
        totalProjects,
        completedProjects,
        inProgressProjects,
        totalCardsProcessed,
      }
    } catch (error) {
      this.logger.error('Failed to fetch project stats:', error)
      throw error
    }
  }
}
