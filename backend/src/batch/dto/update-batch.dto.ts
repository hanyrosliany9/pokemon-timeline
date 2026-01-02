import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator'
import { BatchStatus } from '@pokemon-timeline/shared'

export class UpdateBatchDto {
  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus

  @IsOptional()
  @IsDateString()
  startedAt?: string | null

  @IsOptional()
  @IsDateString()
  completedAt?: string | null

  @IsOptional()
  @IsString()
  notes?: string
}
