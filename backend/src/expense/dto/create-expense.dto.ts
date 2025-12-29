import { IsString, IsOptional, IsEnum, IsNumberString, IsDate, IsArray, IsUrl, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import { Currency } from '@pokemon-timeline/shared'

export class CreateExpenseDto {
  @IsString()
  description: string

  @IsUUID()
  categoryId: string

  @IsNumberString()
  amount: string

  @IsEnum(Currency)
  currency: Currency

  @IsOptional()
  @IsString()
  projectId?: string

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expenseDate?: Date

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsUrl()
  receiptUrl?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] = []
}
