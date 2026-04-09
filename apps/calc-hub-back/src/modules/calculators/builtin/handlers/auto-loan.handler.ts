import { BadRequestException, Injectable } from '@nestjs/common';
import { calcAutoLoan } from '../../auto-loan/auto-loan.engine';
import { AutoLoanCalculateInputDto } from '../../dto/auto-loan-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

@Injectable()
export class AutoLoanHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return calculatorType === 'auto_loan' || slug === 'auto-loan';
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      AutoLoanCalculateInputDto,
      input,
    );
    if (dto.downPayment > dto.carPrice) {
      throw new BadRequestException({
        message: ['downPayment must not exceed carPrice'],
        error: 'Bad Request',
      });
    }
    const result = calcAutoLoan(
      dto as unknown as Parameters<typeof calcAutoLoan>[0],
    );
    return {
      formulaVersion: 'auto-loan',
      result: result as unknown as Record<string, unknown>,
    };
  }
}
