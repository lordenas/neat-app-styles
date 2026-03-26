import { FormulaDslValidationError } from './dsl.errors';
import { FormulaDslValidatorService } from './formula-dsl-validator.service';
import { type FormulaDslDefinition } from './dsl.types';

function buildValidFormula(): FormulaDslDefinition {
  return {
    version: '1.0.0',
    inputs: {
      amount: { type: 'number', required: true },
      rate: { type: 'number', required: true },
    },
    variables: [
      {
        name: 'tax',
        expr: {
          type: 'binary',
          op: '*',
          left: { type: 'input_ref', path: 'amount' },
          right: {
            type: 'binary',
            op: '/',
            left: { type: 'input_ref', path: 'rate' },
            right: { type: 'literal', value: 100 },
          },
        },
      },
    ],
    lookups: {},
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
}

describe('FormulaDslValidatorService', () => {
  const service = new FormulaDslValidatorService();

  it('validates a correct formula', () => {
    expect(service.validate(buildValidFormula())).toBeTruthy();
  });

  it('fails on unknown variable reference', () => {
    const formula = buildValidFormula();
    formula.outputs = [
      { key: 'broken', expr: { type: 'var_ref', name: 'missing' } },
    ];
    expect(() => service.validate(formula)).toThrow(FormulaDslValidationError);
  });

  it('fails on cyclic variable dependency', () => {
    const formula = buildValidFormula();
    formula.variables = [
      { name: 'a', expr: { type: 'var_ref', name: 'b' } },
      { name: 'b', expr: { type: 'var_ref', name: 'a' } },
    ];
    formula.outputs = [{ key: 'x', expr: { type: 'var_ref', name: 'a' } }];
    expect(() => service.validate(formula)).toThrow(FormulaDslValidationError);
  });
});
