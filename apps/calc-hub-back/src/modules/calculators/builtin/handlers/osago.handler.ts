import { Injectable } from '@nestjs/common';
import { calcOsago } from '../../osago/osago.engine';
import { OsagoCalculateInputDto } from '../../dto/osago-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

@Injectable()
export class OsagoHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return calculatorType === 'osago' || slug === 'osago';
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      OsagoCalculateInputDto,
      input,
    );
    const result = calcOsago(dto as unknown as Parameters<typeof calcOsago>[0]);
    return {
      formulaVersion: 'osago',
      result: result as unknown as Record<string, unknown>,
    };
  }
}
