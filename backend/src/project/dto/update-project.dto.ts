import { IsString, IsInt, IsNumber, Min, IsOptional } from 'class-validator'

/**
 * Update Card Project DTO
 */
export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  goalTotal?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerCardUSDT?: number
}
