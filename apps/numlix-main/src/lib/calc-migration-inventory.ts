/**
 * Migration inventory: route slug → legacy component → backend endpoint → status.
 * Used by server proxy and useBackendCalculation to know which calculators use backend.
 */

export type CalcMigrationStatus = "ready" | "gap";

export interface CalcMigrationEntry {
  /** Route segment in app/[lang]/[country]/{slug} */
  routeSlug: string;
  /** Backend path segment: /api/v1/calculate/{backendSlug} */
  backendSlug: string;
  /** Legacy page component path (for reference) */
  legacyComponent: string;
  status: CalcMigrationStatus;
}

/** All calculator routes that render a legacy calculator component. */
export const CALC_ROUTE_SLUGS = [
  "osago",
  "auto-loan",
  "credit-early-repayment",
  "deposit",
  "fuel-consumption",
  "insurance-tenure",
  "loan-interest",
  "microloan",
  "mortgage",
  "ndfl",
  "otpusknye",
  "penalty-contract",
  "peni",
  "property-deduction",
  "property-sale-tax",
  "refinancing",
  "transport-tax",
  "unused-vacation",
  "rastamozhka-auto",
  "vat",
  "gk395",
  "penalty-ddu",
  "subsistence-minimum",
  "alimony-indexation",
  "inflation",
] as const;

export type CalcRouteSlug = (typeof CALC_ROUTE_SLUGS)[number];

const READY_BACKEND_SLUGS = new Set<string>([
  "osago",
  "auto-loan",
  "credit-early-repayment",
  "deposit",
  "fuel-consumption",
  "insurance-tenure",
  "loan-interest",
  "microloan",
  "mortgage",
  "ndfl",
  "otpusknye",
  "penalty-contract",
  "peni",
  "property-deduction",
  "property-sale-tax",
  "refinancing",
  "transport-tax",
  "unused-vacation",
  "rastamozhka-auto",
]);

const ROUTE_TO_LEGACY: Record<string, string> = {
  osago: "OsagoCalculator",
  "auto-loan": "AutoLoanCalculator",
  "credit-early-repayment": "CreditEarlyRepaymentCalculator",
  deposit: "DepositCalculator",
  "fuel-consumption": "FuelConsumptionCalculator",
  "insurance-tenure": "InsuranceTenureCalculator",
  "loan-interest": "LoanInterestCalculator",
  microloan: "MicroloanCalculator",
  mortgage: "MortgageCalculator",
  ndfl: "NdflCalculator",
  otpusknye: "OtpusknyeCalculator",
  "penalty-contract": "PenaltyContractCalculator",
  peni: "PeniCalculator",
  "property-deduction": "PropertyDeductionCalculator",
  "property-sale-tax": "PropertySaleTaxCalculator",
  refinancing: "RefinancingCalculator",
  "transport-tax": "TransportTaxCalculator",
  "unused-vacation": "UnusedVacationCalculator",
  "rastamozhka-auto": "RastamozhkaCalculator",
  vat: "VatCalculator",
  gk395: "Gk395Calculator",
  "penalty-ddu": "PenaltyDduCalculator",
  "subsistence-minimum": "SubsistenceMinimumCalculator",
  "alimony-indexation": "AlimonyIndexationCalculator",
  inflation: "InflationCalculator",
};

/** Full migration inventory: route → backend slug, legacy component, status. */
export const CALC_MIGRATION_INVENTORY: CalcMigrationEntry[] =
  CALC_ROUTE_SLUGS.map((routeSlug) => {
    const backendSlug = routeSlug;
    const legacyComponent = ROUTE_TO_LEGACY[routeSlug] ?? "Unknown";
    const status: CalcMigrationStatus = READY_BACKEND_SLUGS.has(routeSlug)
      ? "ready"
      : "gap";
    return { routeSlug, backendSlug, legacyComponent, status };
  });

/** Slugs that have a backend endpoint and should use server proxy. */
export const READY_NOW_SLUGS: readonly string[] = [...READY_BACKEND_SLUGS];

/** Slugs without backend endpoint; keep local calculation (legacy-local-calc). */
export const GAP_SLUGS: readonly string[] = CALC_ROUTE_SLUGS.filter(
  (s) => !READY_BACKEND_SLUGS.has(s)
);

export function isReadyForBackend(slug: string): boolean {
  return READY_BACKEND_SLUGS.has(slug);
}

export function getInventoryEntry(slug: string): CalcMigrationEntry | undefined {
  return CALC_MIGRATION_INVENTORY.find((e) => e.routeSlug === slug);
}
