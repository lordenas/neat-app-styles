import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, Min } from 'class-validator';

const TERM_UNITS = ['years', 'months'] as const;

export class RefinancingCalculateInputDto {
  @ApiProperty({
    example: 5_000_000,
    minimum: 0,
    description: 'Остаток долга, руб.',
  })
  @IsNumber()
  @Min(0)
  remainingDebt!: number;

  @ApiProperty({
    example: 15,
    minimum: 1,
    description: 'Оставшийся срок',
  })
  @IsNumber()
  @Min(1)
  remainingTerm!: number;

  @ApiProperty({
    enum: TERM_UNITS,
    description: 'Единица срока: years или months',
  })
  @IsIn(TERM_UNITS)
  remainingTermUnit!: (typeof TERM_UNITS)[number];

  @ApiProperty({
    example: 18,
    minimum: 0,
    description: 'Текущая годовая ставка, %',
  })
  @IsNumber()
  @Min(0)
  currentRate!: number;

  @ApiPropertyOptional({
    example: 14,
    minimum: 0,
    description: 'Новая годовая ставка, % (если рефинансирование)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  newRate?: number;

  @ApiPropertyOptional({
    example: 15,
    minimum: 1,
    description: 'Новый срок (если меняется)',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  newTerm?: number;

  @ApiPropertyOptional({
    enum: TERM_UNITS,
    description: 'Единица нового срока',
  })
  @IsOptional()
  @IsIn(TERM_UNITS)
  newTermUnit?: (typeof TERM_UNITS)[number];

  @ApiPropertyOptional({
    example: 4_500_000,
    minimum: 0,
    description: 'Новая сумма кредита (если доп. заём/смена суммы)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  newAmount?: number;
}
