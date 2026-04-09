/**
 * Calc Engine — безопасный парсер формул и резолвер условий видимости.
 *
 * Не использует eval() или Function(). Реализован через рекурсивный
 * descent parser, поддерживающий арифметику и встроенные функции.
 *
 * ## Поддерживаемый синтаксис формул
 * - Литералы: числа (42, 3.14)
 * - Переменные: {key}  → подставляется из values[key]
 * - Операторы: + - * / ( )
 * - Унарный минус: -(x)
 * - Функции: round(x, n), floor(x), ceil(x), abs(x),
 *            min(a, b), max(a, b), pow(x, n), sqrt(x),
 *            if(condition, trueVal, falseVal)
 *
 * ## Примеры формул
 * ```
 * "{amount} * {rate} / 100"
 * "round({price} * (1 + {vat} / 100), 2)"
 * "if({months} > 12, {amount} * 0.9, {amount})"
 * "pow(1 + {rate}/100/12, {months})"
 * ```
 *
 * TODO (бэк): На сервере заменить на mathjs для поддержки более сложных выражений.
 * Edge Function: POST /functions/v1/custom-calc-evaluate
 *   body: { formula: string, values: Record<string, number> }
 *   response: { result: number } | { error: string }
 */

import type { CalcField, VisibilityConfig, VisibilityRule } from "@/types/custom-calc";

// ─── Tokenizer ────────────────────────────────────────────────

type TokenType =
  | "NUMBER"
  | "VAR"
  | "PLUS" | "MINUS" | "STAR" | "SLASH"
  | "LPAREN" | "RPAREN"
  | "COMMA"
  | "IDENT"
  | "EOF";

interface Token {
  type: TokenType;
  value: string | number;
}

function tokenize(expr: string, values: Record<string, number>): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    // Whitespace
    if (/\s/.test(ch)) { i++; continue; }

    // Variable {key}
    if (ch === "{") {
      const end = expr.indexOf("}", i);
      if (end === -1) throw new Error("Unclosed {");
      const key = expr.slice(i + 1, end);
      const val = values[key] ?? 0;
      tokens.push({ type: "NUMBER", value: val });
      i = end + 1;
      continue;
    }

    // Number
    if (/[0-9.]/.test(ch)) {
      let num = "";
      while (i < expr.length && /[0-9.]/.test(expr[i])) num += expr[i++];
      tokens.push({ type: "NUMBER", value: parseFloat(num) });
      continue;
    }

    // Identifier (function names)
    if (/[a-zA-Z_]/.test(ch)) {
      let ident = "";
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) ident += expr[i++];
      tokens.push({ type: "IDENT", value: ident });
      continue;
    }

    switch (ch) {
      case "+": tokens.push({ type: "PLUS", value: "+" }); break;
      case "-": tokens.push({ type: "MINUS", value: "-" }); break;
      case "*": tokens.push({ type: "STAR", value: "*" }); break;
      case "/": tokens.push({ type: "SLASH", value: "/" }); break;
      case "(": tokens.push({ type: "LPAREN", value: "(" }); break;
      case ")": tokens.push({ type: "RPAREN", value: ")" }); break;
      case ",": tokens.push({ type: "COMMA", value: "," }); break;
      default: throw new Error(`Unexpected char: ${ch}`);
    }
    i++;
  }

  tokens.push({ type: "EOF", value: "" });
  return tokens;
}

// ─── Parser (Recursive Descent) ──────────────────────────────

class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token { return this.tokens[this.pos]; }
  private consume(): Token { return this.tokens[this.pos++]; }

  private expect(type: TokenType): Token {
    const t = this.consume();
    if (t.type !== type) throw new Error(`Expected ${type}, got ${t.type}`);
    return t;
  }

  /** expr = term (('+' | '-') term)* */
  parseExpr(): number {
    let left = this.parseTerm();
    while (this.peek().type === "PLUS" || this.peek().type === "MINUS") {
      const op = this.consume().type;
      const right = this.parseTerm();
      left = op === "PLUS" ? left + right : left - right;
    }
    return left;
  }

  /** term = factor (('*' | '/') factor)* */
  private parseTerm(): number {
    let left = this.parseFactor();
    while (this.peek().type === "STAR" || this.peek().type === "SLASH") {
      const op = this.consume().type;
      const right = this.parseFactor();
      if (op === "SLASH") {
        left = right === 0 ? 0 : left / right;
      } else {
        left = left * right;
      }
    }
    return left;
  }

  /** factor = unary | number | '(' expr ')' | ident '(' args ')' */
  private parseFactor(): number {
    const t = this.peek();

    // Unary minus
    if (t.type === "MINUS") {
      this.consume();
      return -this.parseFactor();
    }

    // Number literal
    if (t.type === "NUMBER") {
      this.consume();
      return t.value as number;
    }

    // Parenthesized expression
    if (t.type === "LPAREN") {
      this.consume();
      const val = this.parseExpr();
      this.expect("RPAREN");
      return val;
    }

    // Function call
    if (t.type === "IDENT") {
      const name = this.consume().value as string;
      this.expect("LPAREN");
      const args = this.parseArgs();
      this.expect("RPAREN");
      return this.callFunction(name, args);
    }

    throw new Error(`Unexpected token: ${t.type} (${t.value})`);
  }

  private parseArgs(): number[] {
    const args: number[] = [];
    if (this.peek().type === "RPAREN") return args;
    args.push(this.parseExpr());
    while (this.peek().type === "COMMA") {
      this.consume();
      args.push(this.parseExpr());
    }
    return args;
  }

  private callFunction(name: string, args: number[]): number {
    switch (name.toLowerCase()) {
      case "round":  return args.length >= 2
        ? Math.round(args[0] * Math.pow(10, args[1])) / Math.pow(10, args[1])
        : Math.round(args[0]);
      case "floor":  return Math.floor(args[0]);
      case "ceil":   return Math.ceil(args[0]);
      case "abs":    return Math.abs(args[0]);
      case "sqrt":   return Math.sqrt(args[0]);
      case "pow":    return Math.pow(args[0], args[1] ?? 1);
      case "min":    return Math.min(...args);
      case "max":    return Math.max(...args);
      case "log":    return Math.log(args[0]);
      case "log10":  return Math.log10(args[0]);
      case "if":     return args[0] ? args[1] ?? 0 : args[2] ?? 0;
      default: throw new Error(`Unknown function: ${name}`);
    }
  }
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Вычисляет значение формулы, подставляя переменные из values.
 *
 * @param formula - строка формулы, например "{amount} * {rate} / 100"
 * @param values  - словарь { key: number }
 * @returns вычисленное число или NaN при ошибке
 *
 * @example
 * evaluateFormula("{a} + {b} * 2", { a: 5, b: 3 }) // 11
 * evaluateFormula("round({x} / 12, 2)", { x: 1000 }) // 83.33
 */
export function evaluateFormula(
  formula: string,
  values: Record<string, number>
): number {
  try {
    const tokens = tokenize(formula, values);
    const parser = new Parser(tokens);
    const result = parser.parseExpr();
    return isFinite(result) ? result : 0;
  } catch {
    return NaN;
  }
}

/**
 * Вычисляет все поля типа "result" и возвращает словарь результатов.
 * Итерирует несколько раз для поддержки зависимых формул.
 *
 * @param fields - все поля калькулятора
 * @param inputValues - значения введённые пользователем { fieldKey: number }
 * @returns { fieldKey: computedValue } для всех result-полей
 */
export function evaluateAllFormulas(
  fields: CalcField[],
  inputValues: Record<string, number | string | boolean>
): Record<string, number> {
  // Нормализуем входные значения в числа, учитывая числовые веса полей
  const numValues: Record<string, number> = {};
  for (const field of fields) {
    const rawVal = inputValues[field.key];
    if (rawVal === undefined) continue;

    if (field.type === "checkbox") {
      const isChecked = rawVal === true || rawVal === 1 || rawVal === "true";
      const checkedVal = field.config.checkedValue ?? 1;
      const uncheckedVal = field.config.uncheckedValue ?? 0;
      numValues[field.key] = isChecked ? checkedVal : uncheckedVal;
    } else if (field.type === "radio" || field.type === "select") {
      const strVal = String(rawVal);
      const option = field.config.options?.find((o) => o.value === strVal);
      if (option?.numericValue !== undefined) {
        numValues[field.key] = option.numericValue;
      } else {
        numValues[field.key] = parseFloat(strVal) || 0;
      }
    } else if (typeof rawVal === "boolean") {
      numValues[field.key] = rawVal ? 1 : 0;
    } else if (typeof rawVal === "string") {
      numValues[field.key] = parseFloat(rawVal) || 0;
    } else {
      numValues[field.key] = rawVal;
    }
  }
  // Поля без определения в fields (на случай если что-то пропустили)
  for (const [k, v] of Object.entries(inputValues)) {
    if (numValues[k] === undefined) {
      if (typeof v === "boolean") numValues[k] = v ? 1 : 0;
      else if (typeof v === "string") numValues[k] = parseFloat(v) || 0;
      else numValues[k] = v as number;
    }
  }

  const results: Record<string, number> = {};

  // До 5 проходов для разрешения зависимостей между result-полями
  for (let pass = 0; pass < 5; pass++) {
    const allValues = { ...numValues, ...results };
    for (const field of fields) {
      if (field.type === "result" && field.formula) {
        results[field.key] = evaluateFormula(field.formula, allValues);
      }
    }
  }

  return results;
}

// ─── Visibility Resolver ──────────────────────────────────────

type FieldValues = Record<string, number | string | boolean>;

/**
 * Строит маппинг fieldId → fieldKey из массива полей.
 * Нужен потому что VisibilityRule.fieldId хранит UUID поля,
 * а values индексированы по field.key.
 */
function buildIdToKeyMap(fields: CalcField[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const f of fields) map[f.id] = f.key;
  return map;
}

function evalRule(rule: VisibilityRule, values: FieldValues, idToKey: Record<string, string>): boolean {
  // rule.fieldId может быть как UUID (из builder), так и key (legacy)
  const key = idToKey[rule.fieldId] ?? rule.fieldId;
  const rawVal = values[key];

  switch (rule.operator) {
    case "checked":     return rawVal === true || rawVal === 1 || rawVal === "true";
    case "not_checked": return rawVal === false || rawVal === 0 || rawVal === "false" || rawVal === undefined;
    case "eq":   return String(rawVal) === String(rule.value);
    case "neq":  return String(rawVal) !== String(rule.value);
    case "gt":   return Number(rawVal) > Number(rule.value);
    case "lt":   return Number(rawVal) < Number(rule.value);
    case "gte":  return Number(rawVal) >= Number(rule.value);
    case "lte":  return Number(rawVal) <= Number(rule.value);
    case "in": {
      const variants = String(rule.value).split(",").map((s) => s.trim());
      return variants.includes(String(rawVal));
    }
    default: return true;
  }
}

/**
 * Определяет, должно ли поле быть видимым, исходя из текущих значений полей.
 *
 * @param visibility - конфигурация условий (из CalcField.visibility)
 * @param values     - текущие значения всех полей { key: value }
 * @returns true если поле должно отображаться
 *
 * @example
 * // Показать если сумма > 100
 * resolveVisibility(
 *   { rules: [{ fieldId: "amount", operator: "gt", value: 100 }], logic: "AND" },
 *   { amount: 150 }
 * ) // true
 *
 * // Показать если checkbox выбран
 * resolveVisibility(
 *   { rules: [{ fieldId: "hasInsurance", operator: "checked", value: "" }], logic: "AND" },
 *   { hasInsurance: true }
 * ) // true
 */
export function resolveVisibility(
  visibility: VisibilityConfig | null | undefined,
  values: FieldValues,
  allFields?: CalcField[]
): boolean {
  if (!visibility || !visibility.rules || visibility.rules.length === 0) return true;

  const idToKey = allFields ? buildIdToKeyMap(allFields) : {};
  const results = visibility.rules.map((rule) => evalRule(rule, values, idToKey));

  return visibility.logic === "OR"
    ? results.some(Boolean)
    : results.every(Boolean);
}

/**
 * Возвращает set ключей полей, которые видны при текущих значениях.
 *
 * @param fields - все поля калькулятора
 * @param values - текущие значения
 */
export function getVisibleFieldKeys(
  fields: CalcField[],
  values: FieldValues
): Set<string> {
  const idToKey = buildIdToKeyMap(fields);
  const visible = new Set<string>();
  for (const field of fields) {
    if (resolveVisibility(field.visibility, values, fields)) {
      visible.add(field.key);
    }
  }
  return visible;
}

/**
 * Форматирует число результата согласно настройкам поля.
 */
export function formatResult(
  value: number,
  format: "currency" | "percent" | "number" = "number",
  decimals = 2
): string {
  if (isNaN(value)) return "—";

  switch (format) {
    case "currency":
      return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    case "percent":
      return `${value.toFixed(decimals)} %`;
    default:
      return new Intl.NumberFormat("ru-RU", {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      }).format(value);
  }
}
