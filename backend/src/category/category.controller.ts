import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { CategoryService } from './category.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { Category } from '@prisma/client'

@Controller('api/category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  /**
   * GET /api/category
   * List all categories
   */
  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll()
  }

  /**
   * GET /api/category/:id
   * Get a single category by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findOne(id)
  }

  /**
   * POST /api/category
   * Create a new category
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.create(createCategoryDto)
  }

  /**
   * PATCH /api/category/:id
   * Update a category
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.update(id, updateCategoryDto)
  }

  /**
   * DELETE /api/category/:id
   * Delete a category
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoryService.remove(id)
  }

  /**
   * POST /api/category/seed/defaults
   * Seed default categories (for development/testing)
   */
  @Post('seed/defaults')
  @HttpCode(HttpStatus.CREATED)
  async seedDefaults(): Promise<{ message: string }> {
    await this.categoryService.seedDefaults()
    return { message: 'Default categories seeded' }
  }
}
