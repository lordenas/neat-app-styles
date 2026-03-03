
## Plan: Extract Hero Illustration + Add Second Variant

### Goal
Extract the current hero illustration into its own component, create a second thematic illustration, and randomly render one on page load.

### Files to create
- `src/components/hero/HeroDashboardIllustration.tsx` — current calculator+charts illustration (moved from Index.tsx)
- `src/components/hero/HeroBudgetIllustration.tsx` — new second variant: personal budget/expense tracker theme
- `src/components/hero/HeroIllustration.tsx` — wrapper that picks one randomly via `useMemo(() => Math.random() < 0.5, [])`

### Files to edit
- `src/pages/Index.tsx` — remove inlined hero sub-components, import `<HeroIllustration>` instead

---

### Second Illustration Concept — «Бюджет месяца»

A personal finance monthly budget tracker dashboard in the same glassmorphism style:

```
┌──────────────────────────────────────────────────┐
│  [col 1-3 row 1-2]  Monthly Budget Card          │
│   Доходы: 120 000 ₽   Расходы: 84 500 ₽         │
│   [horizontal progress bar: budget consumed]      │
├───────────────┬──────────────────────────────────┤
│ [col 1-2 r3]  │  [col 3 r3]                      │
│  Category     │  Savings                         │
│  breakdown    │  gauge ring                      │
│  (5 rows)     │                                  │
├───────────────┴──────────────────────────────────┤
│ [col 4-5 r1]   Animated sparkline (Net worth)    │
├─────────────────────────────────────────────────┤
│ [col 4-5 r2]   3 stat tiles: Ипотека / НДФЛ / %  │
└──────────────────────────────────────────────────┘
```

Floating chips: `Кредит`, `Накопления`, `Налог`, `Авто`, `Отпуск`

Both illustrations accept same `parallax` and `chipOffsets`/`chipRefs` props. The wrapper passes them down.

---

### Technical approach
- Move `CALC_CYCLES`, `HeroCalculator`, `HeroResultCard`, `HeroBarChart`, `HeroSparkline`, `HeroDonut` + floating chips array → `HeroDashboardIllustration.tsx`
- New `HeroBudgetIllustration.tsx` uses the same grid/glassmorphism structure, CSS-var colors, no new deps
- `HeroIllustration.tsx` uses `useState(() => Math.random() < 0.5)` to pick variant, passes `parallax` + chip handling as props
- In `Index.tsx`: remove ~270 lines of hero sub-components, replace right column with `<HeroIllustration parallax={parallax} chipRefs={chipRefs} chipOffsets={chipOffsets} />`
