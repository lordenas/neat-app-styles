import { Injectable } from '@nestjs/common';
import { calcOtpusknye } from '../../otpusknye/otpusknye.engine';
import { OtpusknyeCalculateInputDto } from '../../dto/otpusknye-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

@Injectable()
export class OtpusknyeHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return calculatorType === 'otpusknye' || slug === 'otpusknye';
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      OtpusknyeCalculateInputDto,
      input,
    );
    const partialMonths = dto.partialMonths ?? [];
    const result = calcOtpusknye({
      totalEarnings: dto.totalEarnings,
      fullMonths: dto.fullMonths,
      partialMonths,
      vacationDays: dto.vacationDays,
    });
    return {
      formulaVersion: 'otpusknye',
      result: result as unknown as Record<string, unknown>,
    };
  }
}
