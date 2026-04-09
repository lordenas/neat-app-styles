import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const VEHICLE_CATEGORIES = [
  'B',
  'A',
  'C',
  'C_heavy',
  'D',
  'D_small',
  'D_regular',
  'taxi',
  'tractor',
  'trolleybus',
] as const;

export class OsagoCalculateInputDto {
  @ApiProperty({ enum: VEHICLE_CATEGORIES, example: 'B' })
  @IsIn(VEHICLE_CATEGORIES)
  category!: string;

  @ApiProperty({ example: 120, minimum: 1 })
  @IsNumber()
  @Min(1)
  horsePower!: number;

  @ApiProperty({ example: '77', description: 'Код региона регистрации ТС' })
  @IsString()
  regionCode!: string;

  @ApiProperty({ example: 35, minimum: 18, maximum: 99 })
  @IsInt()
  @Min(18)
  @Max(99)
  driverAge!: number;

  @ApiProperty({ example: 10, minimum: 0 })
  @IsInt()
  @Min(0)
  driverExperience!: number;

  @ApiProperty({
    example: 4,
    minimum: 0,
    maximum: 13,
    description: 'Класс КБМ (бонус-малус)',
  })
  @IsInt()
  @Min(0)
  @Max(13)
  kbmClass!: number;

  @ApiProperty({
    example: 12,
    minimum: 3,
    maximum: 12,
    description: 'Период использования (месяцев)',
  })
  @IsInt()
  @Min(3)
  @Max(12)
  usagePeriod!: number;

  @ApiProperty({
    example: false,
    description: 'Без ограничения числа водителей',
  })
  @IsBoolean()
  unlimitedDrivers!: boolean;

  @ApiPropertyOptional({
    example: 4942,
    minimum: 0,
    description:
      'Базовый тариф (в коридоре ЦБ), руб. Если не указан — используется середина коридора по категории.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseTariff?: number;
}
