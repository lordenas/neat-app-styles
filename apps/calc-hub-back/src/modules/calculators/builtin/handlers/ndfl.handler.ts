import { Injectable } from '@nestjs/common';
import { calcNdfl } from '../../ndfl/ndfl.engine';
import { NdflCalculateInputDto } from '../../dto/ndfl-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

@Injectable()
export class NdflHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return calculatorType === 'ndfl' || slug === 'ndfl';
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      NdflCalculateInputDto,
      input,
    );
    const result = calcNdfl({
      income: dto.income,
      incomeType: dto.incomeType,
      isNonResident: dto.isNonResident,
      direction: dto.direction,
      manualRate: dto.manualRate,
    });
    if (result === null) {
      return {
        formulaVersion: 'ndfl',
        result: { gross: 0, tax: 0, net: 0, effectiveRate: 0 },
      };
    }
    return {
      formulaVersion: 'ndfl',
      result: result as unknown as Record<string, unknown>,
    };
  }
}
