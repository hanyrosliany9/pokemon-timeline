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
import { ProjectService } from './project.service'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'

/**
 * Card Project Controller
 * Simple REST API for managing card tracking projects
 */
@Controller('api/project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * GET /api/project - List all projects
   */
  @Get()
  findAll() {
    return this.projectService.findAll()
  }

  /**
   * GET /api/project/stats - Get project statistics
   */
  @Get('stats')
  getStats() {
    return this.projectService.getStats()
  }

  /**
   * GET /api/project/:id - Get single project with entries
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id)
  }

  /**
   * POST /api/project - Create new project
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateProjectDto) {
    return this.projectService.create(createDto)
  }

  /**
   * PATCH /api/project/:id - Update project
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateProjectDto) {
    return this.projectService.update(id, updateDto)
  }

  /**
   * DELETE /api/project/:id - Delete project
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.projectService.remove(id)
  }
}
