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
import { EntryService } from './entry.service'
import { CreateEntryDto } from './dto/create-entry.dto'
import { UpdateEntryDto } from './dto/update-entry.dto'

/**
 * Card Entry Controller
 * REST API for logging card progress at the BATCH level
 */
@Controller('api/entry')
export class EntryController {
  constructor(private readonly entryService: EntryService) {}

  /**
   * POST /api/entry - Log cards completed for a batch
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateEntryDto) {
    return this.entryService.create(createDto)
  }

  /**
   * GET /api/entry/batch/:batchId - Get all entries for a batch
   */
  @Get('batch/:batchId')
  findByBatch(@Param('batchId') batchId: string) {
    return this.entryService.findByBatch(batchId)
  }

  /**
   * GET /api/entry/batch/:batchId/stats - Get batch progress stats
   */
  @Get('batch/:batchId/stats')
  getBatchStats(@Param('batchId') batchId: string) {
    return this.entryService.getBatchStats(batchId)
  }

  /**
   * GET /api/entry/project/:projectId - Get all entries for a project (aggregated)
   */
  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.entryService.findByProject(projectId)
  }

  /**
   * GET /api/entry/project/:projectId/stats - Get project progress stats
   */
  @Get('project/:projectId/stats')
  getStats(@Param('projectId') projectId: string) {
    return this.entryService.getStats(projectId)
  }

  /**
   * PATCH /api/entry/:id - Update an entry
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateEntryDto) {
    return this.entryService.update(id, updateDto)
  }

  /**
   * DELETE /api/entry/:id - Delete an entry
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.entryService.remove(id)
  }
}
