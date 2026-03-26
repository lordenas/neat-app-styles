import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, Min, ValidateIf } from 'class-validator';

export class FuelConsumptionCalculateInputDto {
  @ApiProperty({
    enum: ['consumption', 'trip'],
    description:
      'consumption = средний расход по факту (distance, fuelUsed, fuelPrice); trip = планирование поездки (distance, consumptionPer100, fuelPrice)',
  })
  @IsIn(['consumption', 'trip'])
  mode!: 'consumption' | 'trip';

  @ApiProperty({ example: 500, minimum: 0, description: 'Расстояние, км' })
  @IsNumber()
  @Min(0)
  distance!: number;

  @ApiPropertyOptional({
    example: 40,
    minimum: 0,
    description: 'Израсходовано топлива, л (для mode=consumption)',
  })
  @ValidateIf((o: FuelConsumptionCalculateInputDto) => o.mode === 'consumption')
  @IsNumber()
  @Min(0)
  fuelUsed?: number;

  @ApiPropertyOptional({
    example: 8,
    minimum: 0,
    description: 'Расход л/100км (для mode=trip)',
  })
  @ValidateIf((o: FuelConsumptionCalculateInputDto) => o.mode === 'trip')
  @IsNumber()
  @Min(0)
  consumptionPer100?: number;

  @ApiProperty({ example: 56, minimum: 0, description: 'Цена за литр, ₽' })
  @IsNumber()
  @Min(0)
  fuelPrice!: number;
}
