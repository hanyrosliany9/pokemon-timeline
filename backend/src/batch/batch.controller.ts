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
import { BatchService } from './batch.service'
import { CreateBatchDto } from './dto/create-batch.dto'
import { UpdateBatchDto } from './dto/update-batch.dto'

@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  /**
   * POST /api/batch - Create a new batch
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBatchDto: CreateBatchDto) {
    return this.batchService.create(createBatchDto)
  }

  /**
   * GET /api/batch/project/:projectId - Get all batches for a project
   */
  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.batchService.findByProject(projectId)
  }

  /**
   * GET /api/batch/:id - Get a single batch with expenses
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.batchService.findOne(id)
  }

  /**
   * GET /api/batch/:id/stats - Get batch statistics (projected vs actual)
   */
  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.batchService.getBatchStats(id)
  }

  /**
   * PATCH /api/batch/:id - Update batch status/notes/timestamps
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBatchDto: UpdateBatchDto) {
    return this.batchService.update(id, updateBatchDto)
  }

  /**
   * DELETE /api/batch/:id - Delete a batch
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.batchService.remove(id)
  }
}
