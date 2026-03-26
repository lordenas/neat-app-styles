import { Injectable } from '@nestjs/common';
import { FormulaDslValidationError } from './dsl.errors';
import {
  type ExpressionNode,
  type FormulaDslDefinition,
  type FunctionExpressionNode,
  type VariableNode,
} from './dsl.types';

const MAX_VARIABLES = 128;
const MAX_OUTPUTS = 128;
const MAX_DEPTH = 24;
const MAX_NODE_COUNT = 5000;
const MAX_LOOKUP_TABLES = 128;

@Injectable()
export class FormulaDslValidatorService {
  validate(raw: unknown): FormulaDslDefinition {
    if (!this.isObject(raw)) {
      throw new FormulaDslValidationError(
        'DSL formula must be an object',
        'DSL_NOT_OBJECT',
        '$',
      );
    }

    const formula = raw as Partial<FormulaDslDefinition>;
    if (typeof formula.version !== 'string' || formula.version.trim() === '') {
      throw new FormulaDslValidationError(
        'version is required',
        'DSL_VERSION_REQUIRED',
        '$.version',
      );
    }
    if (!this.isObject(formula.inputs)) {
      throw new FormulaDslValidationError(
        'inputs must be an object',
        'DSL_INPUTS_INVALID',
        '$.inputs',
      );
    }
    if (!Array.isArray(formula.variables)) {
      throw new FormulaDslValidationError(
        'variables must be an array',
        'DSL_VARIABLES_INVALID',
        '$.variables',
      );
    }
    if (!this.isObject(formula.lookups)) {
      throw new FormulaDslValidationError(
        'lookups must be an object',
        'DSL_LOOKUPS_INVALID',
        '$.lookups',
      );
    }
    if (!Array.isArray(formula.outputs)) {
      throw new FormulaDslValidationError(
        'outputs must be an array',
        'DSL_OUTPUTS_INVALID',
        '$.outputs',
      );
    }

    if (formula.variables.length > MAX_VARIABLES) {
      throw new FormulaDslValidationError(
        'too many variables',
        'DSL_VARIABLES_LIMIT',
        '$.variables',
      );
    }
    if (formula.outputs.length > MAX_OUTPUTS) {
      throw new FormulaDslValidationError(
        'too many outputs',
        'DSL_OUTPUTS_LIMIT',
        '$.outputs',
      );
    }

    const inputs = formula.inputs as Record<
      string,
      { type: string; required?: boolean }
    >;
    const variables = formula.variables;
    const lookups = formula.lookups as Record<string, unknown>;
    const outputs = formula.outputs as Array<{ key: string; expr: unknown }>;

    this.validateInputs(inputs);
    this.validateLookups(lookups);

    const variableNames = new Set<string>();
    variables.forEach((item, index) => {
      this.validateVariable(item, index);
      if (variableNames.has(item.name)) {
        throw new FormulaDslValidationError(
          `duplicate variable: ${item.name}`,
          'DSL_DUPLICATE_VARIABLE',
          `$.variables[${index}].name`,
        );
      }
      variableNames.add(item.name);
    });

    const outputKeys = new Set<string>();
    outputs.forEach((item, index) => {
      if (
        !this.isObject(item) ||
        typeof item.key !== 'string' ||
        !item.key.trim()
      ) {
        throw new FormulaDslValidationError(
          'output.key is required',
          'DSL_OUTPUT_KEY_REQUIRED',
          `$.outputs[${index}].key`,
        );
      }
      if (outputKeys.has(item.key)) {
        throw new FormulaDslValidationError(
          `duplicate output: ${item.key}`,
          'DSL_DUPLICATE_OUTPUT',
          `$.outputs[${index}].key`,
        );
      }
      outputKeys.add(item.key);
      this.validateExpression(item.expr, `$.outputs[${index}].expr`, 0, {
        inputNames: new Set(Object.keys(inputs)),
        variableNames,
        lookups: new Set(Object.keys(lookups)),
        nodeCounter: { value: 0 },
      });
    });

    this.validateVariableDependencies(variables, variableNames);
    return formula as FormulaDslDefinition;
  }

  private validateInputs(inputs: Record<string, unknown>): void {
    for (const [name, def] of Object.entries(inputs)) {
      if (!this.isObject(def)) {
        throw new FormulaDslValidationError(
          `input ${name} must be an object`,
          'DSL_INPUT_DEF_INVALID',
          `$.inputs.${name}`,
        );
      }
      const type = def.type;
      if (type !== 'number' && type !== 'string' && type !== 'boolean') {
        throw new FormulaDslValidationError(
          `input ${name} has unsupported type`,
          'DSL_INPUT_TYPE_INVALID',
          `$.inputs.${name}.type`,
        );
      }
    }
  }

  private validateLookups(lookups: Record<string, unknown>): void {
    const entries = Object.entries(lookups);
    if (entries.length > MAX_LOOKUP_TABLES) {
      throw new FormulaDslValidationError(
        'too many lookup tables',
        'DSL_LOOKUPS_LIMIT',
        '$.lookups',
      );
    }
    entries.forEach(([name, table]) => {
      if (!this.isObject(table)) {
        throw new FormulaDslValidationError(
          `lookup ${name} must be an object`,
          'DSL_LOOKUP_TABLE_INVALID',
          `$.lookups.${name}`,
        );
      }
    });
  }

  private validateVariable(variable: VariableNode, index: number): void {
    if (!this.isObject(variable)) {
      throw new FormulaDslValidationError(
        'variable must be an object',
        'DSL_VARIABLE_INVALID',
        `$.variables[${index}]`,
      );
    }
    if (typeof variable.name !== 'string' || variable.name.trim() === '') {
      throw new FormulaDslValidationError(
        'variable.name is required',
        'DSL_VARIABLE_NAME_REQUIRED',
        `$.variables[${index}].name`,
      );
    }
    if (!this.isObject(variable.expr)) {
      throw new FormulaDslValidationError(
        'variable.expr must be an expression node',
        'DSL_VARIABLE_EXPR_INVALID',
        `$.variables[${index}].expr`,
      );
    }
  }

  private validateExpression(
    node: unknown,
    path: string,
    depth: number,
    context: {
      inputNames: Set<string>;
      variableNames: Set<string>;
      lookups: Set<string>;
      nodeCounter: { value: number };
    },
  ): void {
    if (!this.isObject(node)) {
      throw new FormulaDslValidationError(
        'expression node must be an object',
        'DSL_EXPR_NOT_OBJECT',
        path,
      );
    }
    if (depth > MAX_DEPTH) {
      throw new FormulaDslValidationError(
        'max expression depth exceeded',
        'DSL_EXPR_DEPTH_LIMIT',
        path,
      );
    }
    context.nodeCounter.value += 1;
    if (context.nodeCounter.value > MAX_NODE_COUNT) {
      throw new FormulaDslValidationError(
        'max expression node count exceeded',
        'DSL_EXPR_NODE_LIMIT',
        path,
      );
    }

    const expr = node as unknown as ExpressionNode;
    switch (expr.type) {
      case 'literal':
        return;
      case 'input_ref':
        if (typeof expr.path !== 'string' || expr.path.trim() === '') {
          throw new FormulaDslValidationError(
            'input_ref.path is required',
            'DSL_INPUT_REF_PATH',
            `${path}.path`,
          );
        }
        if (!context.inputNames.has(expr.path)) {
          throw new FormulaDslValidationError(
            `unknown input ref: ${expr.path}`,
            'DSL_UNKNOWN_INPUT_REF',
            `${path}.path`,
          );
        }
        return;
      case 'var_ref':
        if (typeof expr.name !== 'string' || expr.name.trim() === '') {
          throw new FormulaDslValidationError(
            'var_ref.name is required',
            'DSL_VAR_REF_NAME',
            `${path}.name`,
          );
        }
        if (!context.variableNames.has(expr.name)) {
          throw new FormulaDslValidationError(
            `unknown variable ref: ${expr.name}`,
            'DSL_UNKNOWN_VAR_REF',
            `${path}.name`,
          );
        }
        return;
      case 'lookup':
        if (!context.lookups.has(expr.table)) {
          throw new FormulaDslValidationError(
            `unknown lookup table: ${expr.table}`,
            'DSL_UNKNOWN_LOOKUP_TABLE',
            `${path}.table`,
          );
        }
        this.validateExpression(expr.key, `${path}.key`, depth + 1, context);
        if (expr.fallback) {
          this.validateExpression(
            expr.fallback,
            `${path}.fallback`,
            depth + 1,
            context,
          );
        }
        return;
      case 'unary':
        if (expr.op !== '-' && expr.op !== '!') {
          throw new FormulaDslValidationError(
            `unsupported unary operator: ${String(expr.op)}`,
            'DSL_UNARY_OP_INVALID',
            `${path}.op`,
          );
        }
        this.validateExpression(expr.arg, `${path}.arg`, depth + 1, context);
        return;
      case 'binary':
        if (
          ![
            '+',
            '-',
            '*',
            '/',
            '%',
            '>',
            '<',
            '>=',
            '<=',
            '==',
            '!=',
            '&&',
            '||',
          ].includes(expr.op)
        ) {
          throw new FormulaDslValidationError(
            `unsupported binary operator: ${String(expr.op)}`,
            'DSL_BINARY_OP_INVALID',
            `${path}.op`,
          );
        }
        this.validateExpression(expr.left, `${path}.left`, depth + 1, context);
        this.validateExpression(
          expr.right,
          `${path}.right`,
          depth + 1,
          context,
        );
        return;
      case 'if':
        this.validateExpression(
          expr.condition,
          `${path}.condition`,
          depth + 1,
          context,
        );
        this.validateExpression(expr.then, `${path}.then`, depth + 1, context);
        this.validateExpression(expr.else, `${path}.else`, depth + 1, context);
        return;
      case 'func':
        this.validateFunctionExpr(expr, path, depth, context);
        return;
      default:
        throw new FormulaDslValidationError(
          `unsupported expression type: ${(expr as { type?: unknown }).type as string}`,
          'DSL_EXPR_TYPE_INVALID',
          `${path}.type`,
        );
    }
  }

  private validateFunctionExpr(
    expr: FunctionExpressionNode,
    path: string,
    depth: number,
    context: {
      inputNames: Set<string>;
      variableNames: Set<string>;
      lookups: Set<string>;
      nodeCounter: { value: number };
    },
  ): void {
    const supported = new Set([
      'min',
      'max',
      'round',
      'abs',
      'clamp',
      'coalesce',
    ]);
    if (!supported.has(expr.name)) {
      throw new FormulaDslValidationError(
        `unsupported function: ${expr.name}`,
        'DSL_FUNCTION_UNSUPPORTED',
        `${path}.name`,
      );
    }
    if (!Array.isArray(expr.args)) {
      throw new FormulaDslValidationError(
        'func.args must be an array',
        'DSL_FUNCTION_ARGS_INVALID',
        `${path}.args`,
      );
    }
    expr.args.forEach((arg, index) => {
      this.validateExpression(
        arg,
        `${path}.args[${index}]`,
        depth + 1,
        context,
      );
    });
  }

  private validateVariableDependencies(
    variables: VariableNode[],
    variableNames: Set<string>,
  ): void {
    const deps = new Map<string, Set<string>>();
    variables.forEach((item) => {
      deps.set(item.name, this.collectVarRefs(item.expr, variableNames));
    });

    const visiting = new Set<string>();
    const visited = new Set<string>();

    const dfs = (name: string): void => {
      if (visited.has(name)) return;
      if (visiting.has(name)) {
        throw new FormulaDslValidationError(
          `cyclic dependency detected for variable: ${name}`,
          'DSL_VARIABLE_CYCLE',
          `$.variables.${name}`,
        );
      }
      visiting.add(name);
      const next = deps.get(name) ?? new Set<string>();
      next.forEach((depName) => dfs(depName));
      visiting.delete(name);
      visited.add(name);
    };

    variables.forEach((item) => dfs(item.name));
  }

  private collectVarRefs(
    node: ExpressionNode,
    variableNames: Set<string>,
  ): Set<string> {
    const out = new Set<string>();
    const walk = (expr: ExpressionNode): void => {
      switch (expr.type) {
        case 'var_ref':
          if (variableNames.has(expr.name)) out.add(expr.name);
          return;
        case 'unary':
          walk(expr.arg);
          return;
        case 'binary':
          walk(expr.left);
          walk(expr.right);
          return;
        case 'if':
          walk(expr.condition);
          walk(expr.then);
          walk(expr.else);
          return;
        case 'lookup':
          walk(expr.key);
          if (expr.fallback) walk(expr.fallback);
          return;
        case 'func':
          expr.args.forEach((arg) => walk(arg));
          return;
        default:
          return;
      }
    };
    walk(node);
    return out;
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
