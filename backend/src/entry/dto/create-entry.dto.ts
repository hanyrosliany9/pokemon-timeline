import { IsString, IsInt, IsOptional, Min } from 'class-validator'

/**
 * Create Card Entry DTO
 * Log cards you've completed for a project
 */
export class CreateEntryDto {
  @IsString()
  projectId: string

  @IsString()
  date: string // ISO date string (YYYY-MM-DD)

  @IsInt()
  @Min(1)
  cardsAdded: number

  @IsOptional()
  @IsString()
  notes?: string
}
