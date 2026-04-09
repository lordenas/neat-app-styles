import { BadRequestException, Injectable } from '@nestjs/common';
import { calculateEarlyRepayment } from '../../early-repayment/early-repayment.engine';
import { EarlyRepaymentCalculateInputDto } from '../../dto/early-repayment-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

@Injectable()
export class CreditEarlyRepaymentHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return (
      calculatorType === 'credit_early_repayment' ||
      slug === 'credit-early-repayment'
    );
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      EarlyRepaymentCalculateInputDto,
      input,
    );
    let issueDate: Date;
    const issueStr = String(dto.issueDate);
    if (issueStr.includes('.')) {
      const [dd, mm, yyyy] = issueStr.split('.');
      issueDate = new Date(
        parseInt(yyyy, 10),
        parseInt(mm, 10) - 1,
        parseInt(dd, 10),
      );
    } else {
      issueDate = new Date(issueStr);
    }
    if (isNaN(issueDate.getTime())) {
      throw new BadRequestException({
        message: ['Invalid issueDate'],
        error: 'Bad Request',
      });
    }
    const earlyPayments = (dto.earlyPayments ?? []).map((ep) => ({
      date: ep.date,
      amount: ep.amount,
      mode: ep.mode as 'reduce_term' | 'reduce_payment',
      recurring: ep.recurring,
      frequency: ep.frequency as 'monthly' | 'quarterly' | 'yearly' | undefined,
      endDate: ep.endDate,
    }));
    const rateChanges = (dto.rateChanges ?? []).map((rc) => ({
      date: rc.date,
      ratePercent: rc.ratePercent,
      recalcMode: rc.recalcMode as 'payment' | 'term',
    }));
    const creditHolidays = (dto.creditHolidays ?? []).map((ch) => ({
      startDate: ch.startDate,
      months: ch.months,
      type: ch.type as 'none' | 'interest',
    }));
    const result = calculateEarlyRepayment(
      dto.loanAmount,
      dto.annualRatePercent,
      dto.termMonths,
      issueDate,
      earlyPayments,
      rateChanges,
      creditHolidays,
      dto.firstPaymentInterestOnly ?? false,
      dto.roundPayment ?? false,
      (dto.roundTo as 'rub' | 'hundred') ?? 'rub',
      dto.transferWeekends ?? false,
      (dto.transferDirection as 'next' | 'prev') ?? 'next',
    );
    return {
      formulaVersion: 'credit-early-repayment',
      result: result as unknown as Record<string, unknown>,
    };
  }
}
