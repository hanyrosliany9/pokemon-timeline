import { Currency } from '@prisma/client'
import { IsString, IsNumber, IsEnum, IsOptional, IsArray, Matches } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateIncomeDto {
  @IsString()
  description: string

  @IsNumber()
  @Type(() => Number)
  amount: number | string

  @IsEnum(Currency)
  currency: Currency

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/, {
    message: 'incomeDate must be a valid date in YYYY-MM-DD or ISO 8601 format',
  })
  incomeDate?: Date | string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]
}
