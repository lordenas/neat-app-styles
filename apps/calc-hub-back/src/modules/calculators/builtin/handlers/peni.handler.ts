import { BadRequestException, Injectable } from '@nestjs/common';
import { calcPeni } from '../../peni/peni.engine';
import { PeniCalculateInputDto } from '../../dto/peni-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

@Injectable()
export class PeniHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return calculatorType === 'peni' || slug === 'peni';
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      PeniCalculateInputDto,
      input,
    );
    const result = calcPeni({
      debt: dto.debt,
      calcType: dto.calcType,
      payerType: dto.payerType,
      dateFrom: dto.dateFrom,
      dateTo: dto.dateTo,
    });
    if (result === null) {
      throw new BadRequestException({
        message: [
          'Invalid input: debt must be positive and dateFrom must be before dateTo',
        ],
        error: 'Bad Request',
      });
    }
    return {
      formulaVersion: 'peni',
      result: result as unknown as Record<string, unknown>,
    };
  }
}
