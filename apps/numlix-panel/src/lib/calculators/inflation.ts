/**
 * Расчёт инфляции: накопительный индекс, обесценение сбережений.
 */

export type InflationData = Record<string, number>;

export type InflationInput = {
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
  inflationData: InflationData;
};

export type InflationResult = {
  inflationPercent: number;
  totalFactor: number;
  annualRates: Record<string, number>;
};

function getRate(data: InflationData, year: string): number {
  const v = data[year];
  return typeof v === "number" && !Number.isNaN(v) ? v : 0;
}

export function computeInflation(input: InflationInput): InflationResult | null {
  const { startMonth, startYear, endMonth, endYear, inflationData } = input;
  if (startYear > endYear) return null;
  if (startYear === endYear && startMonth > endMonth) return null;

  const annualRates: Record<string, number> = {};
  let totalFactor = 1;

  if (startYear === endYear) {
    const monthsInPeriod = endMonth - startMonth + 1;
    const fraction = monthsInPeriod / 12;
    const rate = getRate(inflationData, String(startYear));
    totalFactor = Math.pow(1 + rate / 100, fraction);
    annualRates[String(startYear)] = rate;
  } else {
    const startFraction = (12 - startMonth + 1) / 12;
    const startRate = getRate(inflationData, String(startYear));
    totalFactor *= Math.pow(1 + startRate / 100, startFraction);
    annualRates[String(startYear)] = startRate;

    for (let y = startYear + 1; y < endYear; y++) {
      const r = getRate(inflationData, String(y));
      totalFactor *= 1 + r / 100;
      annualRates[String(y)] = r;
    }

    const endFraction = endMonth / 12;
    const endRate = getRate(inflationData, String(endYear));
    totalFactor *= Math.pow(1 + endRate / 100, endFraction);
    annualRates[String(endYear)] = endRate;
  }

  const inflationPercent = (totalFactor - 1) * 100;
  return { inflationPercent, totalFactor, annualRates };
}

export function priceChange(amount: number, totalFactor: number): number {
  return amount * totalFactor;
}

export function savingsDepreciation(amount: number, totalFactor: number): number {
  return amount / totalFactor;
}

export type CumulativeIndexPoint = { year: number; index: number };

export function getCumulativeIndexSeries(input: InflationInput): CumulativeIndexPoint[] {
  const { startMonth, startYear, endMonth, endYear, inflationData } = input;
  if (startYear > endYear) return [];
  if (startYear === endYear && startMonth > endMonth) return [];

  const points: CumulativeIndexPoint[] = [];
  let factor = 1;

  if (startYear === endYear) {
    points.push({ year: startYear, index: 100 });
    const monthsInPeriod = endMonth - startMonth + 1;
    const fraction = monthsInPeriod / 12;
    const rate = getRate(inflationData, String(startYear));
    factor *= Math.pow(1 + rate / 100, fraction);
    points.push({ year: startYear, index: Math.round(100 * factor * 100) / 100 });
    return points;
  }

  points.push({ year: startYear, index: 100 });
  const startFraction = (12 - startMonth + 1) / 12;
  const startRate = getRate(inflationData, String(startYear));
  factor *= Math.pow(1 + startRate / 100, startFraction);
  points.push({ year: startYear, index: Math.round(100 * factor * 100) / 100 });

  for (let y = startYear + 1; y < endYear; y++) {
    const r = getRate(inflationData, String(y));
    factor *= 1 + r / 100;
    points.push({ year: y, index: Math.round(100 * factor * 100) / 100 });
  }

  const endFraction = endMonth / 12;
  const endRate = getRate(inflationData, String(endYear));
  factor *= Math.pow(1 + endRate / 100, endFraction);
  points.push({ year: endYear, index: Math.round(100 * factor * 100) / 100 });
  return points;
}

/** Historical Russian inflation rates (%) */
export const RUSSIA_INFLATION_DATA: InflationData = {
  "1991": 160.4, "1992": 2508.8, "1993": 840, "1994": 214.8, "1995": 131.6,
  "1996": 21.8, "1997": 11.0, "1998": 84.5, "1999": 36.6, "2000": 20.1,
  "2001": 18.8, "2002": 15.06, "2003": 11.99, "2004": 11.74, "2005": 10.91,
  "2006": 9.0, "2007": 11.87, "2008": 13.28, "2009": 8.80, "2010": 8.78,
  "2011": 6.10, "2012": 6.58, "2013": 6.45, "2014": 11.36, "2015": 12.91,
  "2016": 5.38, "2017": 2.52, "2018": 4.27, "2019": 3.05, "2020": 4.91,
  "2021": 8.39, "2022": 11.94, "2023": 7.42, "2024": 9.52, "2025": 10.0,
};
