import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { IncomeService } from './income.service'
import { CreateIncomeDto } from './dto/create-income.dto'
import { UpdateIncomeDto } from './dto/update-income.dto'

@Controller('api/income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  create(@Body() createIncomeDto: CreateIncomeDto) {
    return this.incomeService.create(createIncomeDto)
  }

  @Get()
  findAll(@Query('skip') skip = '0', @Query('take') take = '100') {
    return this.incomeService.findAll(parseInt(skip), parseInt(take))
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incomeService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIncomeDto: UpdateIncomeDto) {
    return this.incomeService.update(id, updateIncomeDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incomeService.remove(id)
  }
}
