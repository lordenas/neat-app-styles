import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Результат для mode=consumption: per100km, tripCost, costPerKm.
 * Результат для mode=trip: liters, cost.
 */
export class FuelConsumptionCalculateResultDto {
  @ApiProperty({ enum: ['consumption', 'trip'] })
  mode!: 'consumption' | 'trip';

  @ApiPropertyOptional({
    description: 'Расход на 100 км, л (mode=consumption)',
  })
  per100km?: number;

  @ApiPropertyOptional({ description: 'Стоимость поездки, ₽ (оба режима)' })
  tripCost?: number;

  @ApiPropertyOptional({ description: 'Стоимость 1 км, ₽ (mode=consumption)' })
  costPerKm?: number;

  @ApiPropertyOptional({ description: 'Литров на поездку (mode=trip)' })
  liters?: number;

  @ApiPropertyOptional({ description: 'Стоимость поездки, ₽ (mode=trip)' })
  cost?: number;
}
