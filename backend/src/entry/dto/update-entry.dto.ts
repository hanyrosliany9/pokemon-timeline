import { IsString, IsInt, IsOptional, Min } from 'class-validator'

/**
 * Update Card Entry DTO
 */
export class UpdateEntryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  cardsAdded?: number

  @IsOptional()
  @IsString()
  notes?: string
}
