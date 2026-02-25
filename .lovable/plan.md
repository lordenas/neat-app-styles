

## Plan: Merge calculator-design-system-596 into CalcHub

### Summary

Transfer the calculator database (30+ calculators) and their calculation logic from the Next.js project `calculator-design-system-596` into the current CalcHub Vite+React project. Keep CalcHub's design system, UI kit, and infrastructure. Do not touch the `backend`/`server` folder.

---

### Source Project Analysis

The source project is a Next.js monorepo with:
- **`shared/`** -- Pure calculation logic and data (no UI dependencies):
  - `calculator-data.ts` -- Registry of 30+ calculators: categories, metadata, SEO, availability by country
  - `vat.ts` -- VAT rates by country, calculation helpers
  - `ndfl.ts` -- Russian income tax brackets, progressive scale 2025
  - `peni.ts` -- Penalty calculations (tax, utility, salary delay)
  - `gk395.ts` -- Interest per Article 395 of Russian Civil Code
  - `inflation.ts` -- Inflation calculation logic
  - `loan-interest.ts` -- Loan interest per Article 809
  - `ddu-penalty.ts` -- DDU penalty (214-FZ)
  - `penalty-contract.ts` -- Contract penalty calculations
  - `property-deduction.ts` -- Property tax deduction
  - `property-sale-tax.ts` -- Property sale tax (NDFL)
  - `otpusknye.ts` -- Vacation pay calculations
  - `unused-vacation.ts` -- Unused vacation compensation
  - `insurance-tenure.ts` -- Insurance tenure calculator
  - `subsistence-minimum.ts` -- Subsistence minimum by region
  - `production-calendar-ru.ts` -- Russian production calendar
  - `i18n-config.ts` -- i18n configuration (languages, countries)
- **`data/`** -- Static JSON data:
  - `key-rate-ru.json` -- Historical CB RF key rates
  - `production-calendar-ru.json` -- Production calendar data
  - `subsistence-minimum-regions.json` -- Regional subsistence minimum data
- **`client/pages/`** -- 25+ calculator UI pages (Next.js, "use client")
- **`client/lib/`** -- Client-side utility functions (formatting, PDF export, VAT add/exclude)

### Target Project (CalcHub)

Vite + React + react-router-dom + Tailwind + shadcn/ui kit. Currently has:
- 1 working calculator page (`CreditCalculator.tsx`) with fake/hardcoded data
- Landing page with placeholder categories linking to the same credit calculator
- Full i18n setup (i18next, en/ru)
- Full UI component library (50+ components)
- Authentication, dashboard, PDF export infrastructure

---

### Migration Strategy

The approach: **bring source logic into CalcHub** (not the other way around). This preserves CalcHub's design, routing, auth, and Lovable Cloud integration.

### Step-by-step Plan

#### Phase 1: Data & Logic Layer (no UI changes)

**1.1 Copy pure calculation modules into `src/lib/calculators/`**

Create directory `src/lib/calculators/` and port these files (removing Next.js imports, adapting paths):

```text
src/lib/calculators/
  calculator-data.ts      -- from shared/calculator-data.ts
  vat.ts                  -- from shared/vat.ts
  ndfl.ts                 -- from shared/ndfl.ts
  peni.ts                 -- from shared/peni.ts
  gk395.ts                -- from shared/gk395.ts
  inflation.ts            -- from shared/inflation.ts
  loan-interest.ts        -- from shared/loan-interest.ts
  ddu-penalty.ts          -- from shared/ddu-penalty.ts
  penalty-contract.ts     -- from shared/penalty-contract.ts
  property-deduction.ts   -- from shared/property-deduction.ts
  property-sale-tax.ts    -- from shared/property-sale-tax.ts
  otpusknye.ts            -- from shared/otpusknye.ts
  unused-vacation.ts      -- from shared/unused-vacation.ts
  insurance-tenure.ts     -- from shared/insurance-tenure.ts
  subsistence-minimum.ts  -- from shared/subsistence-minimum.ts
  production-calendar-ru.ts
  index.ts                -- barrel export
```

**1.2 Copy static data into `src/data/`**

```text
src/data/
  key-rate-ru.json
  production-calendar-ru.json
  subsistence-minimum-regions.json
```

**1.3 Copy client-side utility functions into `src/lib/`**

Port `formatNumberInput`, `parseNumberInput`, and calculator-specific helpers (VAT add/exclude, PDF export for specific calculators) from `client/lib/`.

Adaptation needed:
- Replace `@shared/...` imports with `@/lib/calculators/...`
- Replace `next/navigation` with `react-router-dom`
- Replace `next/link` with `react-router-dom` `Link`

#### Phase 2: Calculator Pages

**2.1 Create calculator page components in `src/pages/calculators/`**

Port each calculator page from `client/pages/`, adapting:
- `"use client"` directive -- remove (Vite doesn't need it)
- `next/link` -> `react-router-dom` `Link`
- `useParams` from `next/navigation` -> `react-router-dom`
- `import { Header } from "@/components/Header"` -> `SiteHeader`
- `import { Footer } from "@/components/Footer"` -> `SiteFooter`
- Custom input classes -> CalcHub's `<Input>`, `<Select>`, `<Button>`, etc.
- `<VisibleBreadcrumbs>` -> CalcHub's `<Breadcrumb>` components
- `@shared/...` -> `@/lib/calculators/...`

Full list of pages to port (25 calculators):

| Source file | Target route | Category |
|---|---|---|
| VatCalculator.tsx | /vat | taxes |
| NdflCalculator.tsx | /ndfl | taxes |
| PeniCalculator.tsx | /peni | taxes |
| Gk395Calculator.tsx | /gk395 | taxes |
| PenaltyContractCalculator.tsx | /penalty-contract | taxes |
| PenaltyDduCalculator.tsx | /penalty-ddu | taxes |
| PropertyDeductionCalculator.tsx | /property-deduction | taxes |
| PropertySaleTaxCalculator.tsx | /property-sale-tax | taxes |
| MortgageCalculator.tsx | /mortgage | finance |
| CreditEarlyRepaymentCalculator.tsx | /credit-early-repayment | finance |
| RefinancingCalculator.tsx | /refinancing | finance |
| MicroloanCalculator.tsx | /microloan | finance |
| InflationCalculator.tsx | /inflation | finance |
| LoanInterestCalculator.tsx | /loan-interest | finance |
| DepositCalculator.tsx | /deposit | investments |
| OtpusknyeCalculator.tsx | /otpusknye | salary |
| UnusedVacationCalculator.tsx | /unused-vacation | salary |
| InsuranceTenureCalculator.tsx | /insurance-tenure | salary |
| OsagoCalculator.tsx | /osago | automotive |
| TransportTaxCalculator.tsx | /transport-tax | automotive |
| RastamozhkaAutoCalculator.tsx | /rastamozhka-auto | automotive |
| AutoLoanCalculator.tsx | /auto-loan | automotive |
| FuelConsumptionCalculator.tsx | /fuel-consumption | automotive |
| SubsistenceMinimumCalculator.tsx | /subsistence-minimum | legal |
| AlimonyIndexationCalculator.tsx | /alimony-indexation | legal |

**2.2 Add routes in `App.tsx`**

Add lazy-loaded routes for all 25 calculator pages. Group by category for readability.

**2.3 Update landing page (`Index.tsx`)**

Replace hardcoded `popularCalcs` and `categoryKeys` with data from `calculator-data.ts`:
- Use `categories`, `calculatorsByCategory`, `calculatorAvailability`
- Categories link to actual calculator routes (not all to `/credit-calculator`)
- Popular calculators link to their respective pages
- Search filters across all calculators, not just 6

#### Phase 3: i18n Integration

**3.1 Expand translation files**

Add translation keys for all calculator names, descriptions, and UI labels from the source project into `src/i18n/locales/en.json` and `src/i18n/locales/ru.json`.

#### Phase 4: Wrap in CalcHub Design

**4.1 Create a shared calculator layout component**

`src/components/CalculatorLayout.tsx` -- wraps every calculator page with:
- `SiteHeader`
- Breadcrumbs (Home > Category > Calculator)
- SEO `<Helmet>` with calculator metadata
- `SiteFooter`

This replaces the per-page Header/Footer from the source project with a single consistent wrapper.

---

### What Changes and What Stays

| Aspect | Source (calculator-design-system-596) | Target (CalcHub) |
|---|---|---|
| Framework | Next.js (App Router) | Vite + React (stays) |
| Routing | `next/navigation` | `react-router-dom` (stays) |
| UI components | Custom input classes | CalcHub shadcn/ui kit (stays) |
| Header/Footer | Source's Header/Footer | CalcHub SiteHeader/SiteFooter (stays) |
| i18n | i18next (shared config) | CalcHub i18next (stays, expanded) |
| Auth | None | CalcHub Auth + Lovable Cloud (stays) |
| Calculation logic | `shared/*.ts` | Copied to `src/lib/calculators/` |
| Static data | `data/*.json` | Copied to `src/data/` |
| Backend folder | Exists in source | **Not touched** |

### Dependencies

No new npm packages needed. The source project uses `xlsx` for Excel export -- this would be the only potential addition if Excel export is needed. All other dependencies (recharts, date-fns, i18next, lucide-react) are already in CalcHub.

### Execution Order

Due to the scope (25 calculator pages + logic), this should be done in batches:
1. **Batch 1**: Data layer + 3-4 most popular calculators (VAT, NDFL, Mortgage, Peni)
2. **Batch 2**: Tax calculators (GK395, penalties, property deduction, property sale tax)
3. **Batch 3**: Finance calculators (refinancing, microloan, inflation, deposit, loan interest, credit early repayment)
4. **Batch 4**: Salary + automotive + legal calculators
5. **Batch 5**: Landing page update, i18n expansion, testing

### Risks and Mitigations

- **Large scope**: 25 pages is significant. Batched approach prevents breaking the app.
- **UI adaptation**: Source uses custom CSS classes for inputs; need to map to CalcHub's `<Input>`, `<Select>`, etc. component-by-component.
- **Hardcoded Russian text**: Some calculators are Russia-specific. The `calculatorAvailability` mapping already handles this -- only show relevant calculators per country.

