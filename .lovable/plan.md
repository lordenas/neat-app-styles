
## Analysis

### Current state
The `CreditEarlyRepaymentCalculator.tsx` has:
- Real calculation engine (`early-repayment.ts`) for early payments
- Missing 5 features from `CreditCalculator.tsx`:
  1. **Первый платёж – только проценты** — first period is interest-only, principal not repaid
  2. **Округлять платёж** — round monthly payment to rubles or hundreds
  3. **Переносить с выходных** — shift payment dates off weekends (using `production-calendar-ru.ts`)
  4. **Изменение ставки** — rate changes on specific dates with recalculation mode (term/payment)
  5. **Кредитные каникулы** — credit holidays: no payments or interest-only for N months

Note: `/credit-calculator` has these as UI-only mockups with fake data. The early repayment calculator has a **real engine** — so we need to implement actual logic for all 5 features, not just UI.

### Plan

#### 1. Extend `src/lib/calculators/early-repayment.ts`

Add to the input interface:
```typescript
export interface RateChangeEntry {
  id: number;
  date: string;        // dd.MM.yyyy
  ratePercent: number;
  recalcMode: "payment" | "term"; // reduce payment or reduce term
}

export interface CreditHolidayEntry {
  id: number;
  startDate: string;   // dd.MM.yyyy
  months: number;
  type: "none" | "interest"; // no payments or interest-only
}

// Extended input
export interface EarlyRepaymentInput {
  loanAmount: number;
  annualRatePercent: number;
  termMonths: number;
  issueDate: Date;
  earlyPayments: EarlyPaymentEntry[];
  rateChanges: RateChangeEntry[];
  creditHolidays: CreditHolidayEntry[];
  firstPaymentInterestOnly: boolean;
  roundPayment: boolean;
  roundTo: "rub" | "hundred";
  transferWeekends: boolean;
  transferDirection: "next" | "prev";
}
```

Engine changes in `calculateEarlyRepayment`:
- **Rate changes**: Sort by date, for each segment between payments find the applicable rate. When a rate change occurs with `recalcMode="payment"`, recalculate the annuity payment. With `recalcMode="term"`, keep payment same (term shortens).
- **Credit holidays**: For months in holiday range, either skip principal+interest (type="none") or pay only interest (type="interest"). In both cases interest accrues on balance.
- **First payment interest-only**: Month 1 only pays `balance × rMonthly`, no principal reduction.
- **Round payment**: After computing annuity, round up to nearest ruble or hundred.
- **Transfer weekends**: After computing payment date, if it's Sat/Sun/holiday, shift to next/prev working day using `isWorkday()`.

#### 2. Update `CreditEarlyRepaymentCalculator.tsx`

**New state variables:**
```typescript
const [rateChanges, setRateChanges] = useState<RateChangeEntry[]>([]);
const [creditHolidays, setCreditHolidays] = useState<CreditHolidayEntry[]>([]);
const [firstPayInterest, setFirstPayInterest] = useState(false);
const [roundPayment, setRoundPayment] = useState(false);
const [roundTo, setRoundTo] = useState<"rub" | "hundred">("rub");
const [transferWeekend, setTransferWeekend] = useState(false);
const [transferDir, setTransferDir] = useState<"next" | "prev">("next");
```

**Form additions (after existing Ставка field):**

After the rate `<FormRow>`, add inline rate change table (same as credit-calculator):
- "+ Изменение ставки" button next to rate input
- Table with date, rate%, recalc mode (Платёж/Срок), delete button

**Options checkboxes** (after Separator, before collapsible sections):
```
□ Первый платёж – только проценты
□ Округлять платёж → [До рублей ▼]
□ Переносить с выходных → [На следующий рабочий ▼]
```

**New SectionToggle: "Кредитные каникулы"** (with CalendarOff icon):
- Each row: start date, number of months, type (Без платежей / Только проценты), delete
- "+ Добавить" button

**Calculation wiring:**
- Pass all new fields to the engine via `EarlyRepaymentInput`
- `useMemo` dependency array updated

**Schedule table**: Add a "Тип" column marker for holiday rows (visually differentiated)

#### 3. Import additions
- `CalendarOff`, `Wallet`, `Percent` icons from lucide
- `Checkbox` from `@/components/ui/checkbox`
- `RadioGroup`, `RadioGroupItem` from `@/components/ui/radio-group`
- `isWorkday` from `production-calendar-ru`

### Files to edit
1. `src/lib/calculators/early-repayment.ts` — extend engine with 5 new features
2. `src/pages/calculators/CreditEarlyRepaymentCalculator.tsx` — add UI + wire calculation
