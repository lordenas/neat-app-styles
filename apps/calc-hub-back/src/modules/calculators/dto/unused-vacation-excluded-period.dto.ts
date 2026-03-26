import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UnusedVacationExcludedPeriodDto {
  @ApiPropertyOptional({
    example: '2024-06-01',
    description:
      'Начало исключаемого периода (больничный, отпуск без сохранения и т.д.)',
  })
  @IsDateString()
  from!: string;

  @ApiPropertyOptional({
    example: '2024-06-14',
    description: 'Конец исключаемого периода',
  })
  @IsDateString()
  to!: string;

  @ApiPropertyOptional({ description: 'Подпись периода' })
  @IsOptional()
  @IsString()
  label?: string;
}
