import { IsString, IsInt, IsBoolean, IsNumber, IsOptional, IsDateString, Min } from 'class-validator'

export class CreateBatchDto {
  @IsString()
  projectId: string

  @IsInt()
  @Min(1)
  cardsCount: number

  @IsDateString()
  deadlineAt: string

  @IsBoolean()
  useLocalGpu: boolean

  @IsInt()
  @Min(0)
  cloudGpusPlanned: number

  @IsNumber()
  @Min(0)
  cloudHoursPlanned: number

  @IsNumber()
  @Min(0)
  exchangeRateUsed: number

  @IsNumber()
  @Min(0)
  projectedCloudCostIDR: number

  @IsNumber()
  @Min(0)
  projectedElectricityCostIDR: number

  @IsNumber()
  @Min(0)
  projectedTotalCostIDR: number

  @IsNumber()
  @Min(0)
  projectedRevenueIDR: number

  @IsNumber()
  projectedProfitIDR: number

  @IsNumber()
  projectedMarginPercent: number

  @IsNumber()
  @Min(0)
  projectedCostPerCardIDR: number

  @IsNumber()
  projectedProfitPerCardIDR: number

  @IsOptional()
  @IsString()
  notes?: string
}
