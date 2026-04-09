/**
 * Контракт для встроенных (built-in) калькуляторов.
 * Результат расчёта — formulaVersion + result для единого ответа API.
 */
export interface BuiltinCalcContext {
  calculatorSlug: string;
  regionCode: string;
  calculatedAt: string;
}

export interface BuiltinCalcResult {
  formulaVersion: string;
  result: Record<string, unknown>;
}

export interface IBuiltinCalculatorHandler {
  /**
   * Определяет, обрабатывает ли этот handler данный калькулятор.
   */
  supports(calculatorType: string, slug: string): boolean;

  /**
   * Выполняет расчёт. input уже провалидирован вызывающей стороной при необходимости.
   */
  calculate(
    input: Record<string, unknown>,
    context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult>;
}
