/**
 * VAT / GST / Sales tax rates by country.
 */

export type VatCountry = {
  code: string;
  nameKey: string;
  taxNameKey: string;
  standardRate: number;
  reducedRates?: number[];
  isSalesTax?: boolean;
};

export const VAT_COUNTRIES: VatCountry[] = [
  { code: "de", nameKey: "country.de", taxNameKey: "vat.taxName.de", standardRate: 19, reducedRates: [7] },
  { code: "fr", nameKey: "country.fr", taxNameKey: "vat.taxName.fr", standardRate: 20, reducedRates: [10, 5.5, 2.1] },
  { code: "it", nameKey: "vat.countryName.it", taxNameKey: "vat.taxName.it", standardRate: 22, reducedRates: [10, 5, 4] },
  { code: "es", nameKey: "country.es", taxNameKey: "vat.taxName.es", standardRate: 21, reducedRates: [10, 4] },
  { code: "pl", nameKey: "country.pl", taxNameKey: "vat.taxName.pl", standardRate: 23, reducedRates: [8, 5] },
  { code: "nl", nameKey: "country.nl", taxNameKey: "vat.taxName.nl", standardRate: 21, reducedRates: [9] },
  { code: "se", nameKey: "country.se", taxNameKey: "vat.taxName.se", standardRate: 25, reducedRates: [12, 6] },
  { code: "be", nameKey: "vat.countryName.be", taxNameKey: "vat.taxName.be", standardRate: 21, reducedRates: [12, 6] },
  { code: "uk", nameKey: "country.uk", taxNameKey: "vat.taxName.uk", standardRate: 20, reducedRates: [5] },
  { code: "us", nameKey: "country.us", taxNameKey: "vat.taxName.us", standardRate: 0, isSalesTax: true },
  { code: "ru", nameKey: "country.ru", taxNameKey: "vat.taxName.ru", standardRate: 20, reducedRates: [10] },
  { code: "ua", nameKey: "country.ua", taxNameKey: "vat.taxName.ua", standardRate: 20, reducedRates: [7, 14] },
  { code: "kz", nameKey: "country.kz", taxNameKey: "vat.taxName.kz", standardRate: 12 },
  { code: "by", nameKey: "country.by", taxNameKey: "vat.taxName.by", standardRate: 20, reducedRates: [10] },
  { code: "in", nameKey: "country.in", taxNameKey: "vat.taxName.in", standardRate: 18, reducedRates: [12, 5] },
  { code: "ae", nameKey: "country.ae", taxNameKey: "vat.taxName.ae", standardRate: 5 },
  { code: "sa", nameKey: "country.sa", taxNameKey: "vat.taxName.sa", standardRate: 15 },
  { code: "qa", nameKey: "country.qa", taxNameKey: "vat.taxName.qa", standardRate: 0 },
  { code: "eg", nameKey: "country.eg", taxNameKey: "vat.taxName.eg", standardRate: 14 },
  { code: "br", nameKey: "country.br", taxNameKey: "vat.taxName.br", standardRate: 17, reducedRates: [7, 12] },
  { code: "global", nameKey: "country.global", taxNameKey: "vat.taxName.default", standardRate: 20 },
];

const byCode = new Map(VAT_COUNTRIES.map((c) => [c.code, c]));

export function getVatCountry(code: string): VatCountry | undefined {
  return byCode.get(code.toLowerCase());
}

export const US_SALES_TAX_DEFAULT_PERCENT = 7;

export function getEffectiveStandardRate(countryCode: string): number {
  const c = getVatCountry(countryCode);
  if (!c) return 20;
  if (c.isSalesTax && c.standardRate === 0) return US_SALES_TAX_DEFAULT_PERCENT;
  return c.standardRate;
}

export function getVatCountryCodes(): string[] {
  return VAT_COUNTRIES.map((c) => c.code);
}

// VAT calculation functions

export type VatResult = {
  amountExcl: number;
  vatAmount: number;
  amountWithVat: number;
  rateUsed: number;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function addVat(amountExcl: number, ratePercent: number): VatResult {
  const rate = Math.max(0, Math.min(100, ratePercent));
  const vatAmount = round2((amountExcl * rate) / 100);
  const amountWithVat = round2(amountExcl + vatAmount);
  return { amountExcl: round2(amountExcl), vatAmount, amountWithVat, rateUsed: rate };
}

export function excludeVat(amountWithVat: number, ratePercent: number): VatResult {
  const rate = Math.max(0, Math.min(100, ratePercent));
  if (rate >= 100) {
    return { amountExcl: 0, vatAmount: round2(amountWithVat), amountWithVat: round2(amountWithVat), rateUsed: rate };
  }
  const amountExcl = round2(amountWithVat / (1 + rate / 100));
  const vatAmount = round2(amountWithVat - amountExcl);
  return { amountExcl, vatAmount, amountWithVat: round2(amountWithVat), rateUsed: rate };
}
