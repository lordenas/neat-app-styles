import { BadRequestException, Injectable } from '@nestjs/common';
import { calcUnusedVacation } from '../../unused-vacation/unused-vacation.engine';
import { UnusedVacationCalculateInputDto } from '../../dto/unused-vacation-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

function parseDate(s: string): Date {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException(`Invalid date: ${s}`);
  }
  return d;
}

@Injectable()
export class UnusedVacationHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return calculatorType === 'unused_vacation' || slug === 'unused-vacation';
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      UnusedVacationCalculateInputDto,
      input,
    );
    const startDate = parseDate(dto.startDate);
    const endDate = parseDate(dto.endDate);
    if (endDate < startDate) {
      throw new BadRequestException('endDate must not be before startDate');
    }
    const excludedPeriods = (dto.excludedPeriods ?? []).map((p) => ({
      from: parseDate(p.from),
      to: parseDate(p.to),
      label: p.label,
    }));
    const engineInput = {
      avgDailyPay: dto.avgDailyPay,
      startDate,
      endDate,
      annualVacationDays: dto.annualVacationDays,
      usedVacationDays: dto.usedVacationDays,
      excludedPeriods,
    };
    const result = calcUnusedVacation(engineInput);
    return {
      formulaVersion: 'unused-vacation',
      result: result as unknown as Record<string, unknown>,
    };
  }
}
