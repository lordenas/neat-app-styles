# Статус миграции калькуляторов на backend

## Готово (используют backend)

| Slug | Компонент | Примечание |
|------|-----------|------------|
| osago | OsagoCalculator | Эталон: useBackendCalculation + закомментирован локальный calc |
| auto-loan | AutoLoanCalculator | |
| mortgage | MortgageCalculator | schedule по-прежнему строится локально (buildRefinancingSchedule) |

## В работе / по шаблону (ready-now, endpoint есть в swagger)

Для каждого калькулятора из списка ниже применить тот же паттерн:

1. Импорт: `import { useBackendCalculation } from "../../hooks/useBackendCalculation";` (или `@/hooks/useBackendCalculation` в shared src).
2. Закомментировать импорт и вызов локальной функции расчёта.
3. Добавить `useMemo` для `backendRequest`: `{ regionCode: "GLB" (или нужный), input: { ...поля формы } }`.
4. Вызвать `useBackendCalculation<ResultType>(slug, backendRequest)`.
5. Собрать `result` из `backendData?.result` с fallback (нули/пустой массив).
6. Показать `backendError` и `backendLoading` в UI.

Калькуляторы из **ready-now** (endpoint в swagger есть):

- credit-early-repayment
- deposit
- fuel-consumption (два режима: consumption / trip — передавать `mode` в input)
- insurance-tenure
- loan-interest
- microloan
- ndfl
- otpusknye
- penalty-contract
- peni
- property-deduction
- property-sale-tax
- refinancing
- transport-tax
- unused-vacation
- rastamozhka-auto

## Gap (endpoint в swagger отсутствует)

Оставлены на локальном расчёте. Помечены в коде как `legacy-local-calc`. Когда появится endpoint — подключить по тому же паттерну.

- vat
- gk395
- penalty-ddu
- subsistence-minimum
- alimony-indexation
- inflation

## Файлы

- Инвентарь: `src/lib/calc-migration-inventory.ts`
- Типы API: `src/lib/calc-api-types.ts` (в apps/numlix-main и в root src)
- Хук: `src/hooks/useBackendCalculation.ts` (root src, чтобы shared-компоненты могли импортировать)
- Proxy: `src/app/api/calculate/[slug]/route.ts`
- Env: `CALC_API_BASE_URL`, `CALC_API_KEY` (см. `.env.example`)
