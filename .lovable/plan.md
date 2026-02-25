
## Analysis

**Current `CreditEarlyRepaymentCalculator`** (the broken version):
- Simple Card-based layout (not matching credit-calculator style)
- Uses `CalculatorLayout` wrapper (which adds header/footer/sidebar)
- Only 2 basic result cards + savings badge
- No charts, no payment schedule table, no PDF export, no save functionality
- Calculation logic is minimal (just `calculateMortgage` wrapper)

**Target `/credit-calculator` UI patterns**:
- `section-card` class for form and results panels
- `FormRow` component (label left, input right, with tooltip support)
- `SectionToggle` collapsible sections with icons
- Full results section: stat grid → donut pie chart → stacked bar chart → scrollable schedule table
- Action buttons: Print, PDF, Save
- `DatePick` component for date inputs
- Table with sticky header/footer

**What the Early Repayment calculator should have (domain-specific)**:
- Inputs: loan amount, rate, term, early payment amount, early payment date, recalc mode (reduce_term / reduce_payment)
- Ability to add multiple early payments (like credit-calculator's early payments section)
- Results comparison: "without early payment" vs "with early payment"
- Savings highlight (green)
- Donut chart: original total interest vs savings
- Bar chart: payment schedule comparison (before vs after)
- Amortization schedule table with early payment column
- Real calculation engine (not fake data) using annuity formula

**Plan:**

### 1. Build real calculation engine
Create `src/lib/calculators/early-repayment.ts` with:
- Full amortization schedule generation for annuity loans
- Support for multiple one-time early repayments (reduce_term or reduce_payment mode)
- Returns: monthly schedule rows, totals, new term after early payments

### 2. Rewrite `CreditEarlyRepaymentCalculator.tsx`
Complete rewrite matching credit-calculator's UI/UX:

**Layout**: `CalculatorLayout` wrapper → `flex-col lg:flex-row` with left main + right sidebar (inherited from CalculatorLayout)

**Form section** (`section-card`):
- `FormRow` for each input
- Loan amount (formatted number input with ₽ suffix)
- Term (number + years/months select)
- Issue date (DatePick)
- Annual rate (% input)
- Payment type (annuity/differential radio — annuity only for now)
- Early payments collapsible section (SectionToggle with TrendingDown icon):
  - Each row: date, amount, reduce mode (term/payment), delete button
  - Add button
- Calculate button

**Results section** (`section-card`):
- Header with Print / PDF / Save buttons
- Stats grid (6 cells): original payment, new payment, original interest, interest saved, term saved, total saved
- Donut pie chart: original total vs saved
- Stacked bar chart: monthly principal vs interest (after early payments)
- Separator
- Payment schedule table (scrollable, sticky header/footer) with columns: #, date, payment, principal, interest, early payment, balance

**Technical details**:
- Reuse `DatePick` and `FormRow` and `SectionToggle` components (defined inline like in credit-calculator)
- Keep `CalculatorLayout` as wrapper (provides site header, breadcrumbs, sidebar)
- Real computation with `useMemo` on inputs/early payments state
- PDF export using `exportCalculationPdf`
