import { FormulaDslRuntimeError } from './dsl.errors';
import { FormulaDslEngineService } from './formula-dsl-engine.service';
import { type FormulaDslDefinition } from './dsl.types';

const formula: FormulaDslDefinition = {
  version: '1.1.0',
  inputs: {
    amount: { type: 'number', required: true },
    rate: { type: 'number', required: true },
    customerType: { type: 'string' },
  },
  variables: [
    {
      name: 'effectiveRate',
      expr: {
        type: 'lookup',
        table: 'customerRate',
        key: { type: 'input_ref', path: 'customerType' },
        fallback: { type: 'input_ref', path: 'rate' },
      },
    },
    {
      name: 'tax',
      expr: {
        type: 'binary',
        op: '*',
        left: { type: 'input_ref', path: 'amount' },
        right: {
          type: 'binary',
          op: '/',
          left: { type: 'var_ref', name: 'effectiveRate' },
          right: { type: 'literal', value: 100 },
        },
      },
    },
  ],
  lookups: {
    customerRate: {
      vip: 18,
      regular: 20,
    },
  },
  outputs: [
    { key: 'tax', expr: { type: 'var_ref', name: 'tax' } },
    {
      key: 'total',
      expr: {
        type: 'binary',
        op: '+',
        left: { type: 'input_ref', path: 'amount' },
        right: { type: 'var_ref', name: 'tax' },
      },
    },
  ],
};

describe('FormulaDslEngineService', () => {
  const service = new FormulaDslEngineService();

  it('evaluates formula with lookup and arithmetic', () => {
    const result = service.execute(formula, {
      amount: 100,
      rate: 20,
      customerType: 'vip',
    });

    expect(result.outputs.tax).toBe(18);
    expect(result.outputs.total).toBe(118);
  });

  it('throws on division by zero', () => {
    const divZeroFormula: FormulaDslDefinition = {
      ...formula,
      outputs: [
        {
          key: 'bad',
          expr: {
            type: 'binary',
            op: '/',
            left: { type: 'literal', value: 1 },
            right: { type: 'literal', value: 0 },
          },
        },
      ],
    };
    expect(() =>
      service.execute(divZeroFormula, { amount: 10, rate: 20 }),
    ).toThrow(FormulaDslRuntimeError);
  });
});
