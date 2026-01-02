import { IsString, IsInt, IsNumber, IsOptional, Min } from 'class-validator'

/**
 * Create Card Project DTO
 * Simplified: just title and goal - that's all you need!
 * Optional: pricePerCardUSDT for contract pricing
 */
export class CreateProjectDto {
  @IsString()
  title: string

  @IsInt()
  @Min(1)
  goalTotal: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerCardUSDT?: number
}
