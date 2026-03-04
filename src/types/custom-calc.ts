/**
 * Custom Calculator Builder — Types & Backend Contracts
 *
 * MVP: Data is stored in localStorage.
 * Production: Replace localStorage calls with Supabase Edge Functions described below.
 *
 * ============================================================
 * BACKEND CONTRACT (ТЗ для бэка)
 * ============================================================
 *
 * ## Database Schema (PostgreSQL / Supabase)
 *
 * ```sql
 * -- custom_calculators: метаданные калькулятора
 * CREATE TABLE custom_calculators (
 *   id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id     uuid NOT NULL,               -- auth.uid()
 *   slug        text UNIQUE NOT NULL,        -- /c/:slug (URL-friendly)
 *   title       text NOT NULL,
 *   description text,
 *   theme       jsonb DEFAULT '{}',          -- CalcTheme
 *   is_public   boolean DEFAULT false,
 *   created_at  timestamptz DEFAULT now(),
 *   updated_at  timestamptz DEFAULT now()
 * );
 *
 * -- calc_fields: поля калькулятора (упорядочены по order_index)
 * CREATE TABLE calc_fields (
 *   id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   calculator_id   uuid REFERENCES custom_calculators(id) ON DELETE CASCADE,
 *   type            text NOT NULL,
 *   label           text NOT NULL,
 *   key             text NOT NULL,           -- переменная для формул {key}
 *   order_index     integer NOT NULL,
 *   config          jsonb DEFAULT '{}',      -- CalcFieldConfig
 *   formula         text,                    -- только для type=result
 *   visibility      jsonb,                   -- VisibilityConfig | null
 *   created_at      timestamptz DEFAULT now()
 * );
 * ```
 *
 * ## RLS Policies
 * ```sql
 * -- custom_calculators: публичный просмотр + владелец видит свои
 * CREATE POLICY "Public calculators" ON custom_calculators FOR SELECT
 *   USING (is_public = true OR auth.uid() = user_id);
 * CREATE POLICY "Owner insert" ON custom_calculators FOR INSERT
 *   WITH CHECK (auth.uid() = user_id);
 * CREATE POLICY "Owner update" ON custom_calculators FOR UPDATE
 *   USING (auth.uid() = user_id);
 * CREATE POLICY "Owner delete" ON custom_calculators FOR DELETE
 *   USING (auth.uid() = user_id);
 *
 * -- calc_fields: наследуют через join
 * CREATE POLICY "Fields visible with calc" ON calc_fields FOR SELECT
 *   USING (EXISTS (
 *     SELECT 1 FROM custom_calculators c
 *     WHERE c.id = calculator_id AND (c.is_public = true OR c.user_id = auth.uid())
 *   ));
 * ```
 *
 * ## Edge Functions
 *
 * ### POST /functions/v1/custom-calc-save
 * Сохраняет весь калькулятор (upsert).
 * Request body: { calculator: CustomCalculator }
 * Response: { id: string, slug: string }
 * Auth: required (Bearer token)
 *
 * ### GET /functions/v1/custom-calc-get?slug=:slug
 * Публичный доступ по slug (без авторизации для is_public=true).
 * Response: { calculator: CustomCalculator } | 404
 *
 * ### GET /functions/v1/custom-calc-list
 * Список калькуляторов текущего пользователя.
 * Response: { calculators: CustomCalculator[] }
 * Auth: required
 *
 * ### DELETE /functions/v1/custom-calc-delete?id=:id
 * Удаление калькулятора (только владелец).
 * Auth: required
 *
 * ### POST /functions/v1/custom-calc-evaluate
 * Серверная безопасная оценка формулы (mathjs).
 * Request: { formula: string, values: Record<string, number> }
 * Response: { result: number } | { error: string }
 * NOTE: Использовать для валидации формул при сохранении.
 */

// ─── Field Types ─────────────────────────────────────────────

export type CalcFieldType =
  | "number"    // Числовой input (min/max/step)
  | "text"      // Текстовый input (однострочный)
  | "textarea"  // Текстовый input (многострочный)
  | "select"    // Выпадающий список (options[])
  | "radio"     // Радио-кнопки (options[])
  | "checkbox"  // Чекбокс (boolean → 1 / 0 в формулах)
  | "slider"    // Слайдер (min/max/step)
  | "result"    // Вычисляемое поле — только формула, нет ввода
  | "button"    // Кнопка с действием
  | "label";    // Статический текст / заголовок

/** Тип действия кнопки */
export type ButtonActionType =
  | "calculate"  // Пересчитать конкретный result-блок
  | "navigate"   // Перейти по URL (поддержка {переменных})
  | "reset"      // Сбросить форму к значениям по умолчанию
  | "pdf"        // Скачать PDF с результатами
  | "webhook";   // POST-запрос на внешний URL с данными формы

/**
 * Действие «после webhook» — выполняется после успешной отправки.
 * Можно комбинировать несколько.
 */
export interface WebhookPostAction {
  /** Показать toast-сообщение */
  showToast?: boolean;
  /** Текст toast при успехе */
  successMessage?: string;
  /** Текст toast при ошибке */
  errorMessage?: string;
  /** Перейти по URL после успеха */
  redirectUrl?: string;
  /** Открыть redirect в новой вкладке */
  redirectNewTab?: boolean;
  /** Сбросить форму после успеха */
  resetAfter?: boolean;
}

/** Конфигурация кнопки: поддерживает несколько одновременных первичных действий */
export interface ButtonAction {
  /** Основные действия (можно несколько: calculate + webhook, reset + navigate и т.д.) */
  type: ButtonActionType;
  /** Дополнительные действия, выполняемые вместе с основным */
  extraActions?: ButtonActionType[];
  /** Для navigate/webhook: URL (поддерживает {key}) */
  url?: string;
  /** Для calculate: id поля-результата (или пусто = пересчитать все) */
  targetFieldId?: string;
  /** Для navigate: открыть в новой вкладке */
  newTab?: boolean;
  /** После webhook: что сделать */
  webhookPostAction?: WebhookPostAction;
}

/** Вариант оформления статического текста */
export type LabelVariant = "h1" | "h2" | "h3" | "body" | "caption" | "divider";

export interface SelectOption {
  label: string;
  value: string;
}

/** Конфигурация поля (хранится в jsonb calc_fields.config) */
export interface CalcFieldConfig {
  /** Для number/slider: минимальное значение */
  min?: number;
  /** Для number/slider: максимальное значение */
  max?: number;
  /** Для number/slider: шаг */
  step?: number;
  /** Для select/radio: варианты */
  options?: SelectOption[];
  /** Placeholder для number/text */
  placeholder?: string;
  /** Суффикс единицы измерения (₽, %, лет) */
  unit?: string;
  /** Значение по умолчанию */
  defaultValue?: string | number | boolean;
  /** Для result: формат числа (currency | percent | number) */
  format?: "currency" | "percent" | "number";
  /** Для result: количество знаков после запятой */
  decimals?: number;
  /** Подсказка под полем */
  hint?: string;
  /** Для button: вид кнопки */
  buttonVariant?: "default" | "outline" | "destructive" | "ghost";
  /** Для button: действие */
  buttonAction?: ButtonAction;
  /** Для label: вариант оформления */
  labelVariant?: LabelVariant;
  /** Для label: текст содержимого */
  labelContent?: string;
  /** Для textarea: количество строк */
  rows?: number;
  /**
   * Для result: если true — не пересчитывать автоматически при вводе,
   * только по триггеру кнопки (calculate action).
   */
  manualCalculation?: boolean;
}

// ─── Visibility System ───────────────────────────────────────

export type VisibilityOperator =
  | "gt"          // >  (field > value)
  | "lt"          // <
  | "gte"         // >=
  | "lte"         // <=
  | "eq"          // == (строгое равенство)
  | "neq"         // !=
  | "checked"     // checkbox = true
  | "not_checked" // checkbox = false
  | "in";         // значение входит в массив value (через запятую)

/**
 * Одно условие видимости поля.
 * Пример: "если поле amount > 100" → { fieldId: "amount", operator: "gt", value: 100 }
 */
export interface VisibilityRule {
  /** ID поля-источника условия */
  fieldId: string;
  /** Оператор сравнения */
  operator: VisibilityOperator;
  /**
   * Сравниваемое значение.
   * - Для gt/lt/gte/lte: число
   * - Для eq/neq: строка или число
   * - Для checked/not_checked: игнорируется
   * - Для in: строки через запятую ("X,Y,Z")
   */
  value: string | number;
}

/**
 * Конфигурация условного отображения поля.
 * Хранится в jsonb calc_fields.visibility.
 *
 * Примеры:
 * - "Показать если поле А > 100":
 *   { rules: [{ fieldId: "a", operator: "gt", value: 100 }], logic: "AND" }
 * - "Показать если checkbox C выбран":
 *   { rules: [{ fieldId: "c", operator: "checked", value: "" }], logic: "AND" }
 * - "Показать если radio = 'mortgage' ИЛИ > 1000":
 *   { rules: [...], logic: "OR" }
 */
export interface VisibilityConfig {
  rules: VisibilityRule[];
  /** Логика объединения: все условия (AND) или хотя бы одно (OR) */
  logic: "AND" | "OR";
}

// ─── Field ───────────────────────────────────────────────────

/** Одно поле калькулятора */
export interface CalcField {
  /** UUID поля (в MVP: nanoid) */
  id: string;
  /** Тип поля */
  type: CalcFieldType;
  /** Метка (label) — отображается над полем */
  label: string;
  /**
   * Ключ переменной для формул.
   * Используется как {key} в формулах.
   * Только латиница/цифры/underscore, уникален в рамках калькулятора.
   */
  key: string;
  /** Позиция в списке (0-based, глобальная) */
  orderIndex: number;
  /**
   * Идентификатор строки сетки.
   * Поля с одинаковым rowId отображаются в одной строке (максимум 4).
   * По умолчанию = field.id (каждое поле в своей строке).
   */
  rowId: string;
  /** Конфигурация поля */
  config: CalcFieldConfig;
  /**
   * Формула для вычисления (только для type=result).
   * Поддерживаемый синтаксис:
   * - Переменные: {key}
   * - Операторы: + - * / ( )
   * - Функции: round(x,n), floor(x), ceil(x), abs(x),
   *            min(a,b), max(a,b), pow(x,n), sqrt(x), if(cond,a,b)
   * Пример: "round({amount} * {rate} / 100, 2)"
   */
  formula?: string;
  /**
   * Условия видимости поля.
   * Если null/undefined — поле всегда видимо.
   */
  visibility?: VisibilityConfig | null;
}

// ─── Calculator ──────────────────────────────────────────────

/** Тема калькулятора (хранится в jsonb custom_calculators.theme) */
export interface CalcTheme {
  primaryColor?: string;   // hex
  bgColor?: string;        // hex
  borderRadius?: "none" | "sm" | "md" | "lg";
  fontFamily?: string;
}

/** Полный калькулятор */
export interface CustomCalculator {
  /** UUID (в MVP: nanoid) */
  id: string;
  /**
   * URL-slug для публичного плеера (/c/:slug).
   * В MVP: генерируется как nanoid(8).
   * В бэке: UNIQUE constraint в БД.
   */
  slug: string;
  /** Заголовок калькулятора */
  title: string;
  /** Описание */
  description?: string;
  /** Поля калькулятора (отсортированы по orderIndex) */
  fields: CalcField[];
  /** Тема */
  theme?: CalcTheme;
  /**
   * Публично доступен по /c/:slug без авторизации.
   * В бэке: RLS на custom_calculators WHERE is_public = true.
   */
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Storage (MVP localStorage) ──────────────────────────────

/**
 * MVP: Хранение в localStorage под ключом "custom_calculators".
 *
 * TODO (бэк): Заменить на:
 *   POST /functions/v1/custom-calc-save
 *   GET  /functions/v1/custom-calc-list
 *   GET  /functions/v1/custom-calc-get?slug=:slug
 *   DELETE /functions/v1/custom-calc-delete?id=:id
 */
export const STORAGE_KEY = "custom_calculators";

export function loadCalculators(): CustomCalculator[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveCalculator(calc: CustomCalculator): void {
  const all = loadCalculators();
  const idx = all.findIndex((c) => c.id === calc.id);
  if (idx >= 0) all[idx] = calc;
  else all.push(calc);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteCalculator(id: string): void {
  const all = loadCalculators().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getCalculatorBySlug(slug: string): CustomCalculator | null {
  return loadCalculators().find((c) => c.slug === slug) ?? null;
}

export function getCalculatorById(id: string): CustomCalculator | null {
  return loadCalculators().find((c) => c.id === id) ?? null;
}
