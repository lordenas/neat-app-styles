import { BadRequestException, Injectable } from '@nestjs/common';
import { calculateMortgage } from '../../mortgage/mortgage.engine';
import { MortgageCalculateInputDto } from '../../dto/mortgage-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

@Injectable()
export class MortgageHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return calculatorType === 'mortgage' || slug === 'mortgage';
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      MortgageCalculateInputDto,
      input,
    );
    if (dto.downPayment > dto.propertyPrice) {
      throw new BadRequestException({
        message: ['downPayment must not exceed propertyPrice'],
        error: 'Bad Request',
      });
    }
    const result = calculateMortgage(
      dto as unknown as Parameters<typeof calculateMortgage>[0],
    );
    return {
      formulaVersion: 'mortgage',
      result: result as unknown as Record<string, unknown>,
    };
  }
}
