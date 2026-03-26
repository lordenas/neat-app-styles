import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { UnusedVacationExcludedPeriodDto } from './unused-vacation-excluded-period.dto';

export class UnusedVacationCalculateInputDto {
  @ApiProperty({
    example: 2048,
    minimum: 0,
    description: 'Средний дневной заработок, руб.',
  })
  @IsNumber()
  @Min(0)
  avgDailyPay!: number;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Дата начала работы (ISO 8601)',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    example: '2025-02-27',
    description: 'Дата окончания (увольнения или сегодня), ISO 8601',
  })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    example: 28,
    minimum: 1,
    maximum: 365,
    description: 'Положенных дней отпуска в году',
  })
  @IsNumber()
  @Min(1)
  annualVacationDays!: number;

  @ApiProperty({
    example: 0,
    minimum: 0,
    description: 'Уже использовано дней отпуска',
  })
  @IsNumber()
  @Min(0)
  usedVacationDays!: number;

  @ApiPropertyOptional({
    type: [UnusedVacationExcludedPeriodDto],
    description:
      'Исключаемые периоды (больничные, отпуск без сохранения и т.д.)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnusedVacationExcludedPeriodDto)
  excludedPeriods?: UnusedVacationExcludedPeriodDto[];
}
