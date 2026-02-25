
## Plan: UX/UI Improvements for /gk395 Calculator

### Current Issues
1. **Title** is inside the two-column grid (confined to left 1/3 column) — needs to move to the `title` prop of `CalculatorLayout` so it spans full width.
2. **Partial payments / debt increases** inputs are raw `<Input type="date">` and a plain number input with no labels — confusing.
3. **Excluded periods** feature exists in the data model (`ExcludedPeriod[]`) but is completely absent from the UI.
4. **Results table** only shows period rows, not payment/debt-increase events — the full breakdown is filtered.
5. **No empty state** for breakdown — when result is null, only a small text is shown.
6. **Stats cards** are plain divs, could use the existing `StatsCard` pattern with better contrast.
7. **Layout** uses inline `lg:col-span-3` grid inside the layout that already has a right sidebar — this creates a 3-column-inside-2-column which is cramped.
8. **Collapsible sections** for optional features (partial payments, debt increases, excluded periods) would clean up the form.

### Plan

#### 1. Move title to `CalculatorLayout` `title` prop (same pattern as CreditEarlyRepayment)

#### 2. Refactor the form panel
- **Main fields**: Sum + Period dates — keep at top, clearly labeled
- **Optional sections** wrapped in `<Collapsible>` with chevron toggle:
  - "Частичные оплаты" (collapsed by default)
  - "Увеличение долга" (collapsed by default)  
  - "Исключённые периоды" (collapsed by default, currently missing from UI entirely)
- Each entry row: add placeholder labels above date/amount columns for the first row
- Remove button: icon only (Trash2), consistent

#### 3. Improve results display
- Replace plain colored divs with properly styled stat cards using `bg-primary/5` / `bg-amber-500/10` / `bg-green-500/10` scheme
- Show total days count as a 4th stat card
- **Breakdown table**: use `<Table>` component (already imported elsewhere) with proper columns:
  - Период | Сумма долга | Дней | Ставка ЦБ | Формула | Проценты
  - Payment/debt-increase rows styled differently (muted, with badge)
  - Excluded rows shown with strikethrough / opacity
- Add copy-to-clipboard button on the result

#### 4. "О расчёте" section
- Keep it but make it a proper accordion or collapsible to save space

#### 5. No structural changes to `CalculatorLayout` needed — just use the existing `title` prop

### Files to Edit
- `src/pages/calculators/Gk395Calculator.tsx` — full refactor

### What the new layout looks like
```
[CalculatorLayout title prop] ← Full-width heading
┌──────────────────────────────────────────────────────┬─────────────┐
│  [Card: Параметры]                                   │  [Sidebar]  │
│    Сумма долга                                       │  (existing) │
│    Период (с / по)                                   │             │
│    ▶ Частичные оплаты (collapsible)                  │             │
│    ▶ Увеличение долга (collapsible)                  │             │
│    ▶ Исключённые периоды (collapsible)               │             │
│                                                      │             │
│  [Card: Результат]                                   │             │
│    [Stat1: Сумма долга] [Stat2: Проценты] [Stat3: Итого] [Stat4: Дней] │
│    [Table: breakdown rows — all types]               │             │
│                                                      │             │
│  [Card: О расчёте (collapsible)]                     │             │
└──────────────────────────────────────────────────────┴─────────────┘
```

### Key UX Improvements Summary
- Title full-width via `title` prop
- Optional form sections collapsed by default → cleaner first impression
- Full breakdown table with proper columns (formula visible)
- Excluded periods UI added (was missing)
- Payment and debt-increase events shown inline in table with colored badges
- Better stat cards layout with 4 metrics
- Collapsible info section at bottom
