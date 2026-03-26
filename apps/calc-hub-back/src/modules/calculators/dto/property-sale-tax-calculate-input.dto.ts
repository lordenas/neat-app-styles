import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

const ACQUISITION_TYPES = ['purchase', 'other'] as const;

export class PropertySaleTaxCalculateInputDto {
  @ApiPropertyOptional({
    default: false,
    description: 'Право собственности до 2016 года',
  })
  @IsOptional()
  @IsBoolean()
  ownershipBefore2016?: boolean;

  @ApiProperty({
    enum: ACQUISITION_TYPES,
    description: 'Способ приобретения',
  })
  @IsIn(ACQUISITION_TYPES)
  acquisitionType!: (typeof ACQUISITION_TYPES)[number];

  @ApiPropertyOptional({
    default: false,
    description: 'Единственное жильё',
  })
  @IsOptional()
  @IsBoolean()
  isSoleHousing?: boolean;

  @ApiProperty({
    example: 2,
    minimum: 0,
    maximum: 50,
    description: 'Срок владения, лет',
  })
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsHeld!: number;

  @ApiProperty({
    example: 8_000_000,
    minimum: 0,
    description: 'Цена продажи, руб.',
  })
  @IsNumber()
  @Min(0)
  salePrice!: number;

  @ApiProperty({
    example: 7_000_000,
    minimum: 0,
    description: 'Кадастровая стоимость, руб.',
  })
  @IsNumber()
  @Min(0)
  cadastralValue!: number;

  @ApiPropertyOptional({
    example: 0.7,
    minimum: 0,
    maximum: 1,
    default: 0.7,
    description: 'Коэффициент к кадастровой стоимости',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  coefficient?: number;

  @ApiPropertyOptional({
    default: true,
    description: 'Использовать вычет 1 000 000 ₽ (иначе — расходы на покупку)',
  })
  @IsOptional()
  @IsBoolean()
  useFixedDeduction?: boolean;

  @ApiPropertyOptional({
    example: 5_000_000,
    minimum: 0,
    default: 0,
    description: 'Расходы на покупку, руб. (если useFixedDeduction = false)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchaseExpenses?: number;

  @ApiPropertyOptional({
    default: true,
    description: 'Продажа после 01.01.2025 (прогрессивная шкала)',
  })
  @IsOptional()
  @IsBoolean()
  saleAfter2025?: boolean;
}
