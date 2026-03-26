import { Injectable } from '@nestjs/common';
import { calculateDeposit } from '../../deposit/deposit.engine';
import { DepositCalculateInputDto } from '../../dto/deposit-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

@Injectable()
export class DepositHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return calculatorType === 'deposit' || slug === 'deposit';
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      DepositCalculateInputDto,
      input,
    );
    const engineInput = {
      ...dto,
      oneTimeTopUps: dto.oneTimeTopUps ?? [],
      regularTopUps: dto.regularTopUps ?? [],
      oneTimeWithdrawals: dto.oneTimeWithdrawals ?? [],
      regularWithdrawals: dto.regularWithdrawals ?? [],
      minimumBalance: dto.minimumBalance ?? 0,
      keyRatesByYear: dto.keyRatesByYear
        ? Object.fromEntries(
            Object.entries(dto.keyRatesByYear).map(([k, v]) => [Number(k), v]),
          )
        : undefined,
    };
    const result = calculateDeposit(
      engineInput as Parameters<typeof calculateDeposit>[0],
    );
    return {
      formulaVersion: 'deposit',
      result: result as unknown as Record<string, unknown>,
    };
  }
}
