import { IsString, IsNotEmpty, Matches } from 'class-validator'

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z_]+$/, {
    message: 'name must be uppercase with underscores only (e.g., MOTION_WORK)',
  })
  name: string // 'MOTION_WORK' (internal key, unique)

  @IsString()
  @IsNotEmpty()
  label: string // 'Motion Work' (display name)

  @IsString()
  @IsNotEmpty()
  icon: string // 'Video' (Lucide icon name)

  @IsString()
  @IsNotEmpty()
  @Matches(/^#[0-9a-fA-F]{6}$/, {
    message: 'color must be a valid hex color (e.g., #007aff)',
  })
  color: string // '#007aff' (hex color)
}
