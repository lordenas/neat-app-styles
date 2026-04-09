import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

const INCOME_TYPES = [
  'salary',
  'svo',
  'property_sale',
  'rent',
  'securities',
  'dividends',
  'deposit_interest',
  'prize',
  'manual',
] as const;

const DIRECTIONS = ['fromGross', 'fromNet'] as const;

export class NdflCalculateInputDto {
  @ApiProperty({
    example: 100_000,
    minimum: 0,
    description:
      'Сумма дохода (до налога или на руки в зависимости от direction)',
  })
  @IsNumber()
  @Min(0)
  income!: number;

  @ApiProperty({
    enum: INCOME_TYPES,
    description: 'Вид дохода',
  })
  @IsIn(INCOME_TYPES)
  incomeType!: (typeof INCOME_TYPES)[number];

  @ApiProperty({ example: false, description: 'Нерезидент РФ' })
  @IsBoolean()
  isNonResident!: boolean;

  @ApiProperty({
    enum: DIRECTIONS,
    description: 'fromGross — доход до НДФЛ; fromNet — доход на руки',
  })
  @IsIn(DIRECTIONS)
  direction!: (typeof DIRECTIONS)[number];

  @ApiPropertyOptional({
    example: 13,
    minimum: 0,
    maximum: 100,
    description: 'Ставка % (для manual или нерезидента)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  manualRate?: number;
}
