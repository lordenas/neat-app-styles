import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class PenaltyContractExcludedPeriodDto {
  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Начало исключаемого периода',
  })
  @IsDateString()
  from!: string;

  @ApiPropertyOptional({
    example: '2025-01-10',
    description: 'Конец исключаемого периода',
  })
  @IsDateString()
  to!: string;

  @ApiPropertyOptional({ description: 'Комментарий' })
  @IsOptional()
  @IsString()
  comment?: string;
}
