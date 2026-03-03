
## Проблема

**Две баги в `ConditionEditor.tsx`:**

1. **Строка 99**: `relevantOps` для чекбокса = `CHECKBOX_OPS = ["checked", "not_checked"]` — это массив строк, а не объектов `{ value, label, hint }`. В рендере (строки 138–143) код обращается к `op.value`, `op.label`, `op.hint` — для строк это `undefined`, отсюда пустые SelectItem без текста.

2. **Строка 111**: при выборе поля-источника оператор всегда сбрасывается в `"gt"` — даже если выбранное поле является чекбоксом. В итоге текущий оператор `"gt"` не входит в `relevantOps` для чекбокса → Select не находит совпадения.

## Исправления

**Файл: `src/components/calc-builder/ConditionEditor.tsx`**

1. Строка 99 — фильтровать из полного массива `OPERATORS`, а не использовать `CHECKBOX_OPS` как строки:
```ts
// было:
const relevantOps = isCheckboxField ? CHECKBOX_OPS : OPERATORS.filter(...)
// стало:
const relevantOps = isCheckboxField
  ? OPERATORS.filter(o => CHECKBOX_OPS.includes(o.value))
  : OPERATORS.filter(o => !CHECKBOX_OPS.includes(o.value))
```

2. Строка 111 — при выборе поля-источника определить дефолтный оператор в зависимости от типа поля:
```ts
onValueChange={(v) => {
  const selectedField = otherFields.find(f => f.id === v);
  const defaultOp = selectedField?.type === "checkbox" ? "checked" : "gt";
  updateRule(i, { fieldId: v, operator: defaultOp, value: "" });
}}
```

Итого: 2 строки правок, файл один.
