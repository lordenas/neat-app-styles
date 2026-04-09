import { Injectable } from '@nestjs/common';
import { calcPropertyDeduction } from '../../property-deduction/property-deduction.engine';
import { PropertyDeductionCalculateInputDto } from '../../dto/property-deduction-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

function toIncomeByYearRecord(
  raw: Record<string, number> | undefined,
): Record<number, number> {
  const result: Record<number, number> = {};
  if (!raw || typeof raw !== 'object') return result;
  for (const [k, v] of Object.entries(raw)) {
    const year = parseInt(k, 10);
    if (Number.isFinite(year) && typeof v === 'number' && v >= 0) {
      result[year] = v;
    }
  }
  return result;
}

@Injectable()
export class PropertyDeductionHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return (
      calculatorType === 'property_deduction' || slug === 'property-deduction'
    );
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      PropertyDeductionCalculateInputDto,
      input,
    );
    const incomeByYear = toIncomeByYearRecord(dto.incomeByYear);
    const engineInput = {
      propertyPrice: dto.propertyPrice,
      purchaseYear: Math.floor(dto.purchaseYear),
      usedPreviously: dto.usedPreviously ?? false,
      previousUsePeriod:
        dto.usedPreviously && dto.previousUsePeriod
          ? dto.previousUsePeriod
          : null,
      returnedAmount: dto.returnedAmount ?? 0,
      incomeByYear,
    };
    const result = calcPropertyDeduction(engineInput);
    return {
      formulaVersion: 'property-deduction',
      result: result as unknown as Record<string, unknown>,
    };
  }
}
