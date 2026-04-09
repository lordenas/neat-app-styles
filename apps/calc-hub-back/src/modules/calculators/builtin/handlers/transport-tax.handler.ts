import { Injectable } from '@nestjs/common';
import { calcTransportTax } from '../../transport-tax/transport-tax.engine';
import { TransportTaxCalculateInputDto } from '../../dto/transport-tax-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

function getDefaultTaxYear(): number {
  return new Date().getFullYear() - 1;
}

@Injectable()
export class TransportTaxHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return calculatorType === 'transport_tax' || slug === 'transport-tax';
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      TransportTaxCalculateInputDto,
      input,
    );
    const taxYear = dto.taxYear ?? getDefaultTaxYear();
    const carYear = dto.carYear ?? taxYear - 5;
    const engineInput = {
      horsePower: dto.horsePower,
      vehicleCategory: dto.vehicleCategory,
      regionCode: String(dto.regionCode).trim(),
      ownershipMonths: dto.ownershipMonths,
      carPrice: dto.carPrice ?? 0,
      carYear,
      taxYear,
    };
    const result = calcTransportTax(engineInput);
    return {
      formulaVersion: 'transport-tax',
      result: result as unknown as Record<string, unknown>,
    };
  }
}
