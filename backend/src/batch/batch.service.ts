import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Decimal } from 'decimal.js'
import { PrismaService } from '@/database/prisma.service'
import { RedisService } from '@/redis/redis.service'
import { CreateBatchDto } from './dto/create-batch.dto'
import { UpdateBatchDto } from './dto/update-batch.dto'
import { RenderingBatch } from '@prisma/client'

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name)

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * Get all batches for a project
   */
  async findByProject(projectId: string): Promise<RenderingBatch[]> {
    try {
      return await this.prisma.renderingBatch.findMany({
        where: { projectId },
        orderBy: { batchNumber: 'asc' },
        include: {
          expenses: {
            include: { category: true },
          },
        },
      })
    } catch (error) {
      this.logger.error(`Failed to fetch batches for project ${projectId}:`, error)
      throw error
    }
  }

  /**
   * Get a single batch by ID
   */
  async findOne(id: string): Promise<RenderingBatch | null> {
    try {
      return await this.prisma.renderingBatch.findUnique({
        where: { id },
        include: {
          expenses: {
            include: { category: true },
          },
          project: true,
        },
      })
    } catch (error) {
      this.logger.error(`Failed to fetch batch ${id}:`, error)
      throw error
    }
  }

  /**
   * Create a new batch with auto-generated batchNumber
   */
  async create(createDto: CreateBatchDto): Promise<RenderingBatch> {
    try {
      // Validate project exists
      const project = await this.prisma.cardProject.findUnique({
        where: { id: createDto.projectId },
      })
      if (!project) {
        throw new NotFoundException(`Project ${createDto.projectId} not found`)
      }

      // Get next batch number for this project
      const lastBatch = await this.prisma.renderingBatch.findFirst({
        where: { projectId: createDto.projectId },
        orderBy: { batchNumber: 'desc' },
      })
      const batchNumber = (lastBatch?.batchNumber ?? 0) + 1

      const batch = await this.prisma.renderingBatch.create({
        data: {
          projectId: createDto.projectId,
          batchNumber,
          cardsCount: createDto.cardsCount,
          deadlineAt: new Date(createDto.deadlineAt),
          useLocalGpu: createDto.useLocalGpu,
          cloudGpusPlanned: createDto.cloudGpusPlanned,
          cloudHoursPlanned: new Decimal(createDto.cloudHoursPlanned),
          exchangeRateUsed: new Decimal(createDto.exchangeRateUsed),
          projectedCloudCostIDR: new Decimal(createDto.projectedCloudCostIDR),
          projectedElectricityCostIDR: new Decimal(createDto.projectedElectricityCostIDR),
          projectedTotalCostIDR: new Decimal(createDto.projectedTotalCostIDR),
          projectedRevenueIDR: new Decimal(createDto.projectedRevenueIDR),
          projectedProfitIDR: new Decimal(createDto.projectedProfitIDR),
          projectedMarginPercent: new Decimal(createDto.projectedMarginPercent),
          projectedCostPerCardIDR: new Decimal(createDto.projectedCostPerCardIDR),
          projectedProfitPerCardIDR: new Decimal(createDto.projectedProfitPerCardIDR),
          notes: createDto.notes,
        },
        include: {
          expenses: true,
          project: true,
        },
      })

      // Publish event to Redis for real-time sync
      await this.redis.publish('batch:created', {
        batch,
        timestamp: new Date().toISOString(),
      })

      this.logger.log(`Batch #${batchNumber} created for project ${createDto.projectId}`)
      return batch
    } catch (error) {
      this.logger.error('Failed to create batch:', error)
      throw error
    }
  }

  /**
   * Update a batch (status, notes, timestamps)
   */
  async update(id: string, updateDto: UpdateBatchDto): Promise<RenderingBatch> {
    try {
      const existingBatch = await this.prisma.renderingBatch.findUnique({
        where: { id },
      })

      if (!existingBatch) {
        throw new NotFoundException(`Batch ${id} not found`)
      }

      const batch = await this.prisma.renderingBatch.update({
        where: { id },
        data: {
          status: updateDto.status,
          startedAt: updateDto.startedAt ? new Date(updateDto.startedAt) : undefined,
          completedAt: updateDto.completedAt ? new Date(updateDto.completedAt) : undefined,
          notes: updateDto.notes,
        },
        include: {
          expenses: true,
          project: true,
        },
      })

      // Publish event to Redis
      await this.redis.publish('batch:updated', {
        batch,
        timestamp: new Date().toISOString(),
      })

      this.logger.log(`Batch ${id} updated`)
      return batch
    } catch (error) {
      this.logger.error(`Failed to update batch ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete a batch
   */
  async remove(id: string): Promise<RenderingBatch> {
    try {
      const batch = await this.prisma.renderingBatch.delete({
        where: { id },
      })

      // Publish event to Redis
      await this.redis.publish('batch:deleted', {
        batch,
        timestamp: new Date().toISOString(),
      })

      this.logger.log(`Batch ${id} deleted`)
      return batch
    } catch (error) {
      this.logger.error(`Failed to delete batch ${id}:`, error)
      throw error
    }
  }

  /**
   * Get batch statistics (projected vs actual)
   */
  async getBatchStats(batchId: string) {
    try {
      const batch = await this.prisma.renderingBatch.findUnique({
        where: { id: batchId },
        include: { expenses: true },
      })

      if (!batch) {
        throw new NotFoundException(`Batch ${batchId} not found`)
      }

      // Calculate actual cost from linked expenses
      const actualCostIDR = batch.expenses.reduce(
        (sum, exp) => sum.plus(exp.amountIDR),
        new Decimal(0),
      )

      const projectedCost = new Decimal(batch.projectedTotalCostIDR)
      const varianceIDR = actualCostIDR.minus(projectedCost)
      const variancePercent = projectedCost.gt(0)
        ? varianceIDR.dividedBy(projectedCost).times(100)
        : new Decimal(0)

      return {
        batchId,
        projectedCostIDR: projectedCost.toNumber(),
        actualCostIDR: actualCostIDR.toNumber(),
        varianceIDR: varianceIDR.toNumber(),
        variancePercent: variancePercent.toNumber(),
        expenseCount: batch.expenses.length,
      }
    } catch (error) {
      this.logger.error(`Failed to get batch stats ${batchId}:`, error)
      throw error
    }
  }
}
