import * as path from 'path';
import * as fs from 'fs';
import type { KeyRateEntry } from './peni.types';

interface KeyRateData {
  updatedAt: string;
  rates: KeyRateEntry[];
}

let cachedRates: KeyRateEntry[] | null = null;

export function getKeyRateData(): KeyRateEntry[] {
  if (cachedRates) return cachedRates;
  const jsonPath = path.join(process.cwd(), 'dist', 'data', 'key-rate-ru.json');
  const fallbackPath = path.join(
    process.cwd(),
    'src',
    'data',
    'key-rate-ru.json',
  );
  let data: string;
  try {
    data = fs.readFileSync(jsonPath, 'utf-8');
  } catch {
    data = fs.readFileSync(fallbackPath, 'utf-8');
  }
  const parsed = JSON.parse(data) as KeyRateData;
  cachedRates = parsed.rates ?? [];
  return cachedRates;
}
