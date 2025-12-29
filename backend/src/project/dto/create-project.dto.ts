import { IsString, IsInt, Min } from 'class-validator'

/**
 * Create Card Project DTO
 * Simplified: just title and goal - that's all you need!
 */
export class CreateProjectDto {
  @IsString()
  title: string

  @IsInt()
  @Min(1)
  goalTotal: number
}
