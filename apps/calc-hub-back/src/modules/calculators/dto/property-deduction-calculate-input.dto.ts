import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  Min,
} from 'class-validator';

const PREVIOUS_USE_PERIODS = ['before_2014', 'after_2014'] as const;

export class PropertyDeductionCalculateInputDto {
  @ApiProperty({
    example: 10_000_000,
    minimum: 0,
    description: 'Стоимость квартиры, руб.',
  })
  @IsNumber()
  @Min(0)
  propertyPrice!: number;

  @ApiProperty({
    example: 2024,
    description: 'Год покупки',
  })
  @IsNumber()
  @Min(2000)
  purchaseYear!: number;

  @ApiProperty({
    description: 'Доход по годам (год -> сумма), руб.',
    example: { 2022: 1_200_000, 2023: 1_200_000, 2024: 1_200_000 },
  })
  @IsObject()
  incomeByYear!: Record<string, number>;

  @ApiPropertyOptional({
    default: false,
    description: 'Использовал ли вычет ранее',
  })
  @IsOptional()
  @IsBoolean()
  usedPreviously?: boolean;

  @ApiPropertyOptional({
    enum: PREVIOUS_USE_PERIODS,
    description: 'Когда использовали вычет (если usedPreviously)',
  })
  @IsOptional()
  @IsIn(PREVIOUS_USE_PERIODS)
  previousUsePeriod?: (typeof PREVIOUS_USE_PERIODS)[number];

  @ApiPropertyOptional({
    example: 0,
    minimum: 0,
    description: 'Уже возвращено НДФЛ, руб. (если после 2014)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  returnedAmount?: number;
}
