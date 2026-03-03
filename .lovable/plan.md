
## MVP: Конструктор пользовательских калькуляторов (Custom Calc Builder)

### Что строим

Полноценный клиентский MVP по пути `/calc-builder` — drag-and-drop редактор полей, логика формул через `mathjs`-совместимый парсер, условное отображение полей, превью в реальном времени, и публичный плеер `/c/:slug`.

---

### Архитектура

```text
src/
  types/
    custom-calc.ts          ← все типы + JSDoc с бэк-контрактами
  lib/
    calc-engine.ts          ← evaluateFormulas() + resolveVisibility()
  pages/
    CalcBuilder.tsx          ← страница конструктора
    CalcPlayer.tsx           ← страница плеера /c/:slug
  components/
    calc-builder/
      BuilderCanvas.tsx      ← список полей (drag-to-reorder)
      FieldCard.tsx          ← карточка поля с настройками
      FieldTypeMenu.tsx      ← выбор типа поля
      ConditionEditor.tsx    ← редактор условий видимости
      FormulaEditor.tsx      ← редактор формулы с подсветкой переменных
      BuilderPreview.tsx     ← live-превью справа
    calc-player/
      PlayerField.tsx        ← рендер одного поля с условной видимостью
      PlayerResult.tsx       ← отображение результатов формул
```

---

### Типы полей

| Тип | Описание |
|-----|----------|
| `number` | Числовой input (min/max/step) |
| `text` | Текстовый input |
| `select` | Выпадающий список (options) |
| `radio` | Радио-кнопки |
| `checkbox` | Чекбокс (boolean) |
| `slider` | Слайдер (min/max/step) |
| `result` | Вычисляемое поле (только формула) |

---

### Система условий (Visibility Rules)

Каждое поле может иметь массив `visibilityRules`:

```typescript
// Структура одного условия:
type VisibilityRule = {
  fieldId: string;           // ID поля-источника
  operator: "gt" | "lt" | "eq" | "neq" | "gte" | "lte" | "checked" | "not_checked" | "in";
  value: string | number;    // сравниваемое значение
}

// Логика между правилами:
type VisibilityConfig = {
  rules: VisibilityRule[];
  logic: "AND" | "OR";       // как объединять несколько правил
}
```

**Примеры из ТЗ:**
- "Если поле А > 100 → показать поле Б": `{ fieldId: "A", operator: "gt", value: 100 }`
- "Если checkbox C выбран → показать поле D": `{ fieldId: "C", operator: "checked", value: true }`
- "Если radio выбрано значение X → показать поле E": `{ fieldId: "C", operator: "eq", value: "X" }`

---

### Система формул

Поля типа `result` имеют формулу в виде строки. Движок `calc-engine.ts` заменяет `{fieldId}` на текущие значения и вычисляет через безопасный парсер (на клиенте — встроенный, на беке — `mathjs`).

```typescript
// Пример формулы:
"{amount} * {rate} / 100 / 12 * pow((1 + {rate}/100/12), {months}) / (pow((1 + {rate}/100/12), {months}) - 1)"
// Встроенные функции: round(), floor(), ceil(), abs(), min(), max(), pow(), sqrt()
```

Движок на клиенте: собственный рекурсивный парсер (без eval()) поддерживающий +, -, *, /, скобки, и встроенные функции. ~150 строк кода, безопасен.

---

### Бэк-контракты (JSDoc ТЗ в types/custom-calc.ts)

**Таблицы БД:**

```sql
-- custom_calculators: метаданные калькулятора
CREATE TABLE custom_calculators (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,               -- владелец
  slug        text UNIQUE NOT NULL,        -- /c/:slug
  title       text NOT NULL,
  description text,
  theme       jsonb DEFAULT '{}',          -- primaryColor, bgColor, etc.
  is_public   boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- calc_fields: поля калькулятора (упорядочены по order_index)
CREATE TABLE calc_fields (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calculator_id   uuid REFERENCES custom_calculators(id) ON DELETE CASCADE,
  type            text NOT NULL,           -- number|text|select|radio|checkbox|slider|result
  label           text NOT NULL,
  key             text NOT NULL,           -- переменная для формул {key}
  order_index     integer NOT NULL,
  config          jsonb DEFAULT '{}',      -- min, max, step, options[], placeholder, etc.
  formula         text,                    -- только для type=result
  visibility      jsonb,                   -- { rules: [...], logic: "AND"|"OR" }
  created_at      timestamptz DEFAULT now()
);
```

**Edge Functions (ТЗ):**
- `POST /functions/v1/custom-calc-save` — сохранение всего калькулятора (fields + config)
- `GET /functions/v1/custom-calc-get?slug=:slug` — публичный доступ по slug (без авторизации)
- `POST /functions/v1/custom-calc-evaluate` — серверная проверка формул (безопасность)

**RLS:**
- `custom_calculators`: SELECT where `is_public = true` OR `auth.uid() = user_id`
- `calc_fields`: наследуют через JOIN с калькулятором

---

### Что реализуем в MVP (клиент)

1. **`src/types/custom-calc.ts`** — все типы + полное JSDoc ТЗ для бэка
2. **`src/lib/calc-engine.ts`** — движок формул (без eval) + resolveVisibility()
3. **`src/pages/CalcBuilder.tsx`** — страница `/calc-builder` с SiteHeader/Footer
4. **`src/components/calc-builder/BuilderCanvas.tsx`** — список полей с возможностью добавлять/удалять/переставлять
5. **`src/components/calc-builder/FieldCard.tsx`** — карточка настройки поля (label, key, type, config)
6. **`src/components/calc-builder/ConditionEditor.tsx`** — UI для rules видимости
7. **`src/components/calc-builder/FormulaEditor.tsx`** — textarea с подсветкой `{переменных}`
8. **`src/components/calc-builder/BuilderPreview.tsx`** — live-превью плеера
9. **`src/pages/CalcPlayer.tsx`** — публичный плеер `/c/:slug` (из localStorage в MVP)
10. **`src/components/calc-player/PlayerField.tsx`** + **`PlayerResult.tsx`** — рендер полей с условиями
11. Роуты в `App.tsx`: `/calc-builder`, `/calc-builder/:id`, `/c/:slug`
12. Хранилище MVP: `localStorage` с полным JSDoc "заменить на API"
