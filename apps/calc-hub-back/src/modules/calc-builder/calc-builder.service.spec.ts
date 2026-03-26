/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { CalcBuilderService } from './calc-builder.service';
import { PlanLimitsService } from './plan-limits.service';

describe('CalcBuilderService', () => {
  const dbService = {} as any;
  const service = new CalcBuilderService(dbService, new PlanLimitsService());

  it('evaluates valid numeric formula', () => {
    const result = service.evaluateFormula({
      formula: 'round({amount} * {rate} / 100, 2)',
      values: { amount: 1000, rate: 20 },
    });
    expect(result).toEqual({ result: 200 });
  });

  it('returns error on invalid expression', () => {
    const result = service.evaluateFormula({
      formula: 'notAllowed({amount})',
      values: { amount: 1000 },
    });
    expect(result).toHaveProperty('error');
  });
});
