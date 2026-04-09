import { Injectable } from '@nestjs/common';
import { FormulaDslRuntimeError } from './dsl.errors';
import {
  type ExpressionNode,
  type FormulaDslDefinition,
  type FormulaDslExecutionResult,
  type RuntimeValue,
} from './dsl.types';

interface ExecuteOptions {
  trace?: boolean;
}

@Injectable()
export class FormulaDslEngineService {
  execute(
    formula: FormulaDslDefinition,
    input: Record<string, unknown>,
    options?: ExecuteOptions,
  ): FormulaDslExecutionResult {
    const vars = new Map<string, RuntimeValue>();

    for (const variable of formula.variables) {
      const value = this.evalExpr(variable.expr, {
        formula,
        input,
        vars,
        path: `$.variables.${variable.name}`,
      });
      vars.set(variable.name, value);
    }

    const outputs: Record<string, RuntimeValue> = {};
    for (const output of formula.outputs) {
      outputs[output.key] = this.evalExpr(output.expr, {
        formula,
        input,
        vars,
        path: `$.outputs.${output.key}`,
      });
    }

    const result: FormulaDslExecutionResult = {
      outputs,
      engineMeta: {
        version: formula.version,
        traceEnabled: Boolean(options?.trace),
      },
    };
    if (options?.trace) {
      result.variablesSnapshot = Object.fromEntries(vars.entries());
    }
    return result;
  }

  private evalExpr(
    expr: ExpressionNode,
    context: {
      formula: FormulaDslDefinition;
      input: Record<string, unknown>;
      vars: Map<string, RuntimeValue>;
      path: string;
    },
  ): RuntimeValue {
    switch (expr.type) {
      case 'literal':
        return expr.value;
      case 'input_ref':
        return this.normalize(this.readInput(context.input, expr.path));
      case 'var_ref': {
        const value = context.vars.get(expr.name);
        if (typeof value === 'undefined') {
          throw new FormulaDslRuntimeError(
            `variable is not available: ${expr.name}`,
            'DSL_RUNTIME_VAR_UNSET',
            `${context.path}.var_ref`,
          );
        }
        return value;
      }
      case 'lookup': {
        const table = context.formula.lookups[expr.table];
        const keyValue = this.evalExpr(expr.key, {
          ...context,
          path: `${context.path}.lookup.key`,
        });
        const key = this.toLookupKey(keyValue, `${context.path}.lookup.key`);
        if (Object.prototype.hasOwnProperty.call(table, key)) {
          return this.normalize(table[key] as RuntimeValue);
        }
        if (expr.fallback) {
          return this.evalExpr(expr.fallback, {
            ...context,
            path: `${context.path}.lookup.fallback`,
          });
        }
        throw new FormulaDslRuntimeError(
          `lookup key not found: ${expr.table}.${key}`,
          'DSL_RUNTIME_LOOKUP_MISS',
          `${context.path}.lookup`,
        );
      }
      case 'unary': {
        const arg = this.evalExpr(expr.arg, {
          ...context,
          path: `${context.path}.unary`,
        });
        if (expr.op === '-') return this.negate(arg, context.path);
        if (expr.op === '!') return !this.toBoolean(arg);
        throw new FormulaDslRuntimeError(
          'unsupported unary operator',
          'DSL_RUNTIME_UNARY_OP',
          context.path,
        );
      }
      case 'binary': {
        const left = this.evalExpr(expr.left, {
          ...context,
          path: `${context.path}.left`,
        });
        const right = this.evalExpr(expr.right, {
          ...context,
          path: `${context.path}.right`,
        });
        return this.evalBinary(expr.op, left, right, context.path);
      }
      case 'if': {
        const condition = this.evalExpr(expr.condition, {
          ...context,
          path: `${context.path}.if.condition`,
        });
        const branch = this.toBoolean(condition) ? expr.then : expr.else;
        return this.evalExpr(branch, {
          ...context,
          path: `${context.path}.if.branch`,
        });
      }
      case 'func': {
        const args = expr.args.map((arg, index) =>
          this.evalExpr(arg, {
            ...context,
            path: `${context.path}.func.args[${index}]`,
          }),
        );
        return this.execFunc(expr.name, args, context.path);
      }
    }
  }

  private evalBinary(
    op: string,
    left: RuntimeValue,
    right: RuntimeValue,
    path: string,
  ): RuntimeValue {
    switch (op) {
      case '+':
        return this.toNumber(left) + this.toNumber(right);
      case '-':
        return this.toNumber(left) - this.toNumber(right);
      case '*':
        return this.toNumber(left) * this.toNumber(right);
      case '/': {
        const divisor = this.toNumber(right);
        if (divisor === 0) {
          throw new FormulaDslRuntimeError(
            'division by zero',
            'DSL_RUNTIME_DIV_ZERO',
            path,
          );
        }
        return this.toNumber(left) / divisor;
      }
      case '%': {
        const divisor = this.toNumber(right);
        if (divisor === 0) {
          throw new FormulaDslRuntimeError(
            'modulo by zero',
            'DSL_RUNTIME_MOD_ZERO',
            path,
          );
        }
        return this.toNumber(left) % divisor;
      }
      case '>':
        return this.toNumber(left) > this.toNumber(right);
      case '<':
        return this.toNumber(left) < this.toNumber(right);
      case '>=':
        return this.toNumber(left) >= this.toNumber(right);
      case '<=':
        return this.toNumber(left) <= this.toNumber(right);
      case '==':
        return left === right;
      case '!=':
        return left !== right;
      case '&&':
        return this.toBoolean(left) && this.toBoolean(right);
      case '||':
        return this.toBoolean(left) || this.toBoolean(right);
      default:
        throw new FormulaDslRuntimeError(
          `unsupported binary op: ${op}`,
          'DSL_RUNTIME_BINARY_OP',
          path,
        );
    }
  }

  private execFunc(
    name: string,
    args: RuntimeValue[],
    path: string,
  ): RuntimeValue {
    switch (name) {
      case 'min':
        return Math.min(...args.map((arg) => this.toNumber(arg)));
      case 'max':
        return Math.max(...args.map((arg) => this.toNumber(arg)));
      case 'round': {
        if (args.length === 0) return 0;
        const value = this.toNumber(args[0]);
        const precision = args.length > 1 ? this.toNumber(args[1]) : 0;
        const factor = 10 ** precision;
        return Math.round(value * factor) / factor;
      }
      case 'abs':
        return Math.abs(this.toNumber(args[0] ?? 0));
      case 'clamp': {
        const value = this.toNumber(args[0] ?? 0);
        const min = this.toNumber(args[1] ?? 0);
        const max = this.toNumber(args[2] ?? 0);
        return Math.min(Math.max(value, min), max);
      }
      case 'coalesce': {
        for (const arg of args) {
          if (arg !== null && typeof arg !== 'undefined') {
            return arg;
          }
        }
        return null;
      }
      default:
        throw new FormulaDslRuntimeError(
          `unsupported function: ${name}`,
          'DSL_RUNTIME_FUNCTION_UNSUPPORTED',
          path,
        );
    }
  }

  private readInput(
    input: Record<string, unknown>,
    path: string,
  ): RuntimeValue {
    const segments = path.split('.');
    let current: unknown = input;
    for (const segment of segments) {
      if (typeof current !== 'object' || current === null) {
        return null;
      }
      current = (current as Record<string, unknown>)[segment];
    }
    return this.normalize(current as RuntimeValue);
  }

  private negate(value: RuntimeValue, path: string): number {
    return -this.toNumber(value, path);
  }

  private toBoolean(value: RuntimeValue): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value.length > 0;
    return Boolean(value);
  }

  private toNumber(value: RuntimeValue, path = '$'): number {
    const numberValue = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numberValue)) {
      throw new FormulaDslRuntimeError(
        `value is not a finite number: ${this.describeValue(value)}`,
        'DSL_RUNTIME_NUMBER_INVALID',
        path,
      );
    }
    return numberValue;
  }

  private normalize(value: RuntimeValue): RuntimeValue {
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        return null;
      }
      return value;
    }
    return value;
  }

  private toLookupKey(value: RuntimeValue, path: string): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean')
      return String(value);
    if (value === null) return 'null';
    throw new FormulaDslRuntimeError(
      'lookup key must be primitive value',
      'DSL_RUNTIME_LOOKUP_KEY_INVALID',
      path,
    );
  }

  private describeValue(value: RuntimeValue): string {
    if (typeof value === 'string') return value;
    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null
    ) {
      return `${value}`;
    }
    return '[complex]';
  }
}
