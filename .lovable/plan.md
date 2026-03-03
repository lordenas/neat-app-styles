
## Drag-and-drop с сеткой для полей калькулятора

### Анализ текущего состояния

- `BuilderCanvas.tsx` — простой список полей с кнопками ArrowUp/ArrowDown
- `CalcField` в `types/custom-calc.ts` имеет только `orderIndex: number` — нет поля для ширины/колонок
- `BuilderPreview.tsx` и `PlayerField.tsx` — поля в `space-y-4` (вертикально)
- `FieldCard.tsx` — уже есть `dragHandleProps` пропс, но не используется

### Что добавляем

**1. Новое поле `colSpan` в `CalcField`**
```ts
colSpan?: 1 | 2; // 1 = половина, 2 = вся ширина (default)
```
Сетка: 2 колонки. Поле шириной 2 = на всю строку, 1 = пол-ширины.

**2. Нативный HTML5 drag-and-drop в `BuilderCanvas.tsx`**
Без внешних библиотек (проект уже использует нативный DnD в `SortableListShowcase.tsx`). Drag начинается по `GripVertical` handle, при drop меняем `orderIndex`.

Логика:
- `dragId` — id перетаскиваемого поля
- `overId` — id поля, над которым находимся
- `onDrop` — меняем позиции в массиве

**3. Кнопка переключения ширины в `FieldCard.tsx`**
Маленькая кнопка в header карточки: иконка `Columns` (1 col) ↔ `Square` (2 col). Переключает `colSpan: 1 | 2`.

**4. Сетка в `BuilderCanvas.tsx`**
Поля рендерятся в grid:
```tsx
<div className="grid grid-cols-2 gap-2">
  {fields.map(field => (
    <div className={field.colSpan === 1 ? "col-span-1" : "col-span-2"}>
      <FieldCard ... />
    </div>
  ))}
</div>
```

**5. Та же сетка в `BuilderPreview.tsx` и `PlayerField.tsx`/`CalcPlayer.tsx`**
Плеер (`BuilderPreview` и `CalcPlayer`) применяет ту же `grid grid-cols-2` логику — поля со `colSpan=1` встают рядом.

### Файлы для изменения

| Файл | Изменение |
|------|-----------|
| `src/types/custom-calc.ts` | Добавить `colSpan?: 1 \| 2` в `CalcField` |
| `src/components/calc-builder/BuilderCanvas.tsx` | Нативный DnD + grid layout |
| `src/components/calc-builder/FieldCard.tsx` | Кнопка переключения `colSpan`, убрать ArrowUp/Down |
| `src/components/calc-builder/BuilderPreview.tsx` | Grid layout в превью |
| `src/components/calc-player/PlayerField.tsx` | Обернуть в контейнер без собственного div (layout снаружи) |
| `src/pages/CalcPlayer.tsx` | Grid layout в плеере |

### UX сетки

```text
Builder Canvas (grid-cols-2):
┌─────────────────────────────────────┐
│ [≡] Сумма [Число]     colSpan=2     │  ← вся ширина
├──────────────────┬──────────────────┤
│ [≡] Срок [Число] │ [≡] % [Число]   │  ← colSpan=1 + colSpan=1 = рядом
├──────────────────┴──────────────────┤
│ [≡] Итог [Результат]  colSpan=2     │
└─────────────────────────────────────┘
```

Кнопка ширины в header FieldCard — маленький toggle `⬛` / `◫` рядом с иконкой удаления.
