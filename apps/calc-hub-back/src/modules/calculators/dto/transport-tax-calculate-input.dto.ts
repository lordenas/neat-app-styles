import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const VEHICLE_CATEGORIES = [
  'passenger_car',
  'motorcycle',
  'bus',
  'truck',
  'snowmobile',
  'boat',
  'yacht',
  'jetski',
  'towed_vessel',
  'aircraft_engine',
  'jet_aircraft',
  'other_no_engine',
  'other_self_propelled',
] as const;

export class TransportTaxCalculateInputDto {
  @ApiProperty({
    example: 150,
    minimum: 0,
    description:
      'Мощность (л.с.) / тяга (кгс) / тоннаж в зависимости от категории',
  })
  @IsNumber()
  @Min(0)
  horsePower!: number;

  @ApiProperty({
    enum: VEHICLE_CATEGORIES,
    description: 'Категория ТС',
  })
  @IsIn(VEHICLE_CATEGORIES)
  vehicleCategory!: (typeof VEHICLE_CATEGORIES)[number];

  @ApiProperty({
    example: '77',
    description: 'Код региона (субъект РФ)',
  })
  @IsString()
  regionCode!: string;

  @ApiProperty({
    example: 12,
    minimum: 1,
    maximum: 12,
    description: 'Полных месяцев владения в году',
  })
  @IsNumber()
  @Min(1)
  @Max(12)
  ownershipMonths!: number;

  @ApiPropertyOptional({
    example: 2_000_000,
    minimum: 0,
    default: 0,
    description: 'Стоимость авто, руб. (для легковых — повышающий коэффициент)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carPrice?: number;

  @ApiPropertyOptional({
    example: 2020,
    description: 'Год выпуска (для легковых — расчёт коэффициента роскоши)',
  })
  @IsOptional()
  @IsNumber()
  @Min(1990)
  carYear?: number;

  @ApiPropertyOptional({
    example: 2024,
    description: 'Налоговый год (по умолчанию — предыдущий)',
  })
  @IsOptional()
  @IsNumber()
  @Min(2000)
  taxYear?: number;
}
