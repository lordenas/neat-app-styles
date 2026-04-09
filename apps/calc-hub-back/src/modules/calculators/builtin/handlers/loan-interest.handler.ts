import { Injectable } from '@nestjs/common';
import { calcLoanInterest } from '../../loan-interest/loan-interest.engine';
import { LoanInterestCalculateInputDto } from '../../dto/loan-interest-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

@Injectable()
export class LoanInterestHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return calculatorType === 'loan_interest' || slug === 'loan-interest';
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      LoanInterestCalculateInputDto,
      input,
    );
    const engineInput = {
      principal: dto.principal,
      startDate: dto.startDate,
      endDate: dto.endDate,
      initialRatePercent: dto.initialRatePercent,
      rateChanges: dto.rateChanges ?? [],
      payouts: dto.payouts ?? [],
      debtIncreases: dto.debtIncreases ?? [],
      payoutAppliesToInterestFirst: dto.payoutAppliesToInterestFirst ?? true,
    };
    const result = calcLoanInterest(
      engineInput as Parameters<typeof calcLoanInterest>[0],
    );
    return {
      formulaVersion: 'loan-interest',
      result: result as unknown as Record<string, unknown>,
    };
  }
}
