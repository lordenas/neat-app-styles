import { Injectable } from '@nestjs/common';
import {
  calcFuelConsumption,
  calcFuelNeeded,
} from '../../fuel-consumption/fuel-consumption.engine';
import { FuelConsumptionCalculateInputDto } from '../../dto/fuel-consumption-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

@Injectable()
export class FuelConsumptionHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return calculatorType === 'fuel_consumption' || slug === 'fuel-consumption';
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      FuelConsumptionCalculateInputDto,
      input,
    );
    if (dto.mode === 'consumption') {
      const fuelUsed = dto.fuelUsed ?? 0;
      const result = calcFuelConsumption({
        distance: dto.distance,
        fuelUsed,
        fuelPrice: dto.fuelPrice,
      });
      return {
        formulaVersion: 'fuel-consumption',
        result: {
          mode: 'consumption',
          per100km: result.per100km,
          tripCost: result.tripCost,
          costPerKm: result.costPerKm,
        } as unknown as Record<string, unknown>,
      };
    }
    const consumptionPer100 = dto.consumptionPer100 ?? 0;
    const result = calcFuelNeeded(
      dto.distance,
      consumptionPer100,
      dto.fuelPrice,
    );
    return {
      formulaVersion: 'fuel-consumption',
      result: {
        mode: 'trip',
        liters: result.liters,
        cost: result.cost,
      } as unknown as Record<string, unknown>,
    };
  }
}
