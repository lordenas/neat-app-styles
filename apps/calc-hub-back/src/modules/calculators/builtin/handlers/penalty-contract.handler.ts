import { BadRequestException, Injectable } from '@nestjs/common';
import { calcPenaltyContract } from '../../penalty-contract/penalty-contract.engine';
import { PenaltyContractCalculateInputDto } from '../../dto/penalty-contract-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

@Injectable()
export class PenaltyContractHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return calculatorType === 'penalty_contract' || slug === 'penalty-contract';
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      PenaltyContractCalculateInputDto,
      input,
    );
    const result = calcPenaltyContract({
      sum: dto.sum,
      startDate: dto.startDate,
      endDate: dto.endDate,
      workdaysOnly: dto.workdaysOnly,
      excludedPeriods: dto.excludedPeriods ?? [],
      rateType: dto.rateType,
      rateValue: dto.rateValue,
      limitType: dto.limitType,
      limitValue: dto.limitValue,
      partialPayments: dto.partialPayments ?? [],
      additionalDebts: dto.additionalDebts ?? [],
      showPerDebt: dto.showPerDebt ?? false,
    });
    if (result === null) {
      throw new BadRequestException({
        message: [
          'Invalid input: sum must be positive and startDate must be before endDate',
        ],
        error: 'Bad Request',
      });
    }
    return {
      formulaVersion: 'penalty-contract',
      result: result as unknown as Record<string, unknown>,
    };
  }
}
