import { Injectable } from '@nestjs/common';
import { calcInsuranceTenure } from '../../insurance-tenure/insurance-tenure.engine';
import { InsuranceTenureCalculateInputDto } from '../../dto/insurance-tenure-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

@Injectable()
export class InsuranceTenureHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return calculatorType === 'insurance_tenure' || slug === 'insurance-tenure';
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      InsuranceTenureCalculateInputDto,
      input,
    );
    const validPeriods = (dto.periods ?? []).filter(
      (p) => p.startDate && p.endDate,
    );
    const result = calcInsuranceTenure(validPeriods);
    return {
      formulaVersion: 'insurance-tenure',
      result: result as unknown as Record<string, unknown>,
    };
  }
}
