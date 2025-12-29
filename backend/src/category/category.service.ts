import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { RedisService } from '../redis/redis.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { Category } from '@prisma/client'

@Injectable()
export class CategoryService {
  // Default categories to seed
  private readonly DEFAULT_CATEGORIES = [
    {
      name: 'CROPPING',
      label: 'Cropping',
      icon: 'Scissors',
      color: '#bf5af2',
    },
    {
      name: 'MOTION_WORK',
      label: 'Motion Work',
      icon: 'Video',
      color: '#007aff',
    },
    {
      name: 'TOOLS',
      label: 'Tools',
      icon: 'Wrench',
      color: '#ff9500',
    },
    {
      name: 'SOFTWARE',
      label: 'Software',
      icon: 'Code',
      color: '#34c759',
    },
    {
      name: 'HARDWARE',
      label: 'Hardware',
      icon: 'Cpu',
      color: '#ff3b30',
    },
    {
      name: 'OUTSOURCING',
      label: 'Outsourcing',
      icon: 'Users',
      color: '#ff2d55',
    },
    {
      name: 'MISCELLANEOUS',
      label: 'Miscellaneous',
      icon: 'MoreHorizontal',
      color: '#f59e0b',
    },
  ]

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * Get all categories
   */
  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    })
  }

  /**
   * Get single category by ID
   */
  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    })

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    return category
  }

  /**
   * Create a new category
   */
  async create(dto: CreateCategoryDto): Promise<Category> {
    // Check if category name already exists
    const existing = await this.prisma.category.findUnique({
      where: { name: dto.name },
    })

    if (existing) {
      throw new ConflictException(`Category with name "${dto.name}" already exists`)
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        label: dto.label,
        icon: dto.icon,
        color: dto.color,
      },
    })

    // Publish event to Redis for real-time sync
    await this.redis.publish('category:created', {
      category,
      timestamp: new Date().toISOString(),
    })

    return category
  }

  /**
   * Update a category
   */
  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    // Verify category exists
    await this.findOne(id)

    // If updating name, check for conflicts
    if (dto.name) {
      const existing = await this.prisma.category.findUnique({
        where: { name: dto.name },
      })

      if (existing && existing.id !== id) {
        throw new ConflictException(`Category with name "${dto.name}" already exists`)
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.label && { label: dto.label }),
        ...(dto.icon && { icon: dto.icon }),
        ...(dto.color && { color: dto.color }),
      },
    })

    // Publish event to Redis for real-time sync
    await this.redis.publish('category:updated', {
      category,
      timestamp: new Date().toISOString(),
    })

    return category
  }

  /**
   * Delete a category
   * Prevents deletion if expenses are using this category
   */
  async remove(id: string): Promise<void> {
    // Verify category exists
    await this.findOne(id)

    // Check if any expenses use this category
    const expenseCount = await this.prisma.expense.count({
      where: { categoryId: id },
    })

    if (expenseCount > 0) {
      throw new BadRequestException(
        `Cannot delete category: ${expenseCount} expense(s) are using it. Delete or reassign those expenses first.`,
      )
    }

    await this.prisma.category.delete({
      where: { id },
    })

    // Publish event to Redis for real-time sync
    await this.redis.publish('category:deleted', {
      categoryId: id,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Seed default categories if none exist
   * Called on application startup
   */
  async seedDefaults(): Promise<void> {
    // Check if any categories exist
    const count = await this.prisma.category.count()

    if (count > 0) {
      // Categories already exist, skip seeding
      return
    }

    // Create default categories
    await this.prisma.category.createMany({
      data: this.DEFAULT_CATEGORIES,
      skipDuplicates: true,
    })

    console.log('✓ Default expense categories seeded')
  }

  /**
   * Get default categories (for reference)
   */
  getDefaults(): typeof this.DEFAULT_CATEGORIES {
    return this.DEFAULT_CATEGORIES
  }
}
