import { Injectable } from '@nestjs/common';
import {
  calculateRefinancing,
  buildRefinancingSchedule,
} from '../../refinancing/refinancing.engine';
import { RefinancingCalculateInputDto } from '../../dto/refinancing-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

@Injectable()
export class RefinancingHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return calculatorType === 'refinancing' || slug === 'refinancing';
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      RefinancingCalculateInputDto,
      input,
    );
    const amountChanged = dto.newAmount != null;
    const termChanged = dto.newTerm != null && dto.newTermUnit != null;
    const rateChanged = dto.newRate != null;
    const engineInput = {
      remainingDebt: dto.remainingDebt,
      remainingTerm: dto.remainingTerm,
      termUnit: dto.remainingTermUnit,
      currentRate: dto.currentRate,
      newAmount: dto.newAmount,
      newTerm: dto.newTerm,
      newTermUnit: dto.newTermUnit,
      newRate: dto.newRate,
      amountChanged,
      termChanged,
      rateChanged,
    };
    const result = calculateRefinancing(engineInput);
    const { chartData } = buildRefinancingSchedule(
      result.effectivePrincipal,
      result.effectiveRate,
      result.effectiveTermMonths,
      'year',
    );
    return {
      formulaVersion: 'refinancing',
      result: {
        ...result,
        scheduleData: chartData.slice(0, 30),
      } as unknown as Record<string, unknown>,
    };
  }
}
