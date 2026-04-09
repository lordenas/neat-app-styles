import { Injectable } from '@nestjs/common';
import { calculateMicroloan } from '../../microloan/microloan.engine';
import { MicroloanCalculateInputDto } from '../../dto/microloan-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

@Injectable()
export class MicroloanHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return calculatorType === 'microloan' || slug === 'microloan';
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      MicroloanCalculateInputDto,
      input,
    );
    const result = calculateMicroloan(
      dto as unknown as Parameters<typeof calculateMicroloan>[0],
    );
    return {
      formulaVersion: 'microloan',
      result: result as unknown as Record<string, unknown>,
    };
  }
}
