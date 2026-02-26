/**
 * Калькулятор ОСАГО — расчёт стоимости полиса по коэффициентам ЦБ РФ.
 * Базовые тарифы и коэффициенты актуальны на 2024-2025.
 */

export type VehicleCategory = "B" | "A" | "C" | "C_heavy" | "D" | "D_small" | "D_regular" | "taxi" | "tractor" | "trolleybus";

export type OsagoInput = {
  category: VehicleCategory;
  horsePower: number;
  regionCode: string;
  driverAge: number;
  driverExperience: number;
  kbmClass: number;
  usagePeriod: number;
  unlimitedDrivers: boolean;
};

export type OsagoResult = {
  baseTariff: number;
  kt: number;
  kvs: number;
  kbm: number;
  km: number;
  ks: number;
  ko: number;
  total: number;
};

// Базовые тарифы (середина коридора ЦБ) по категориям
const BASE_TARIFFS: Record<VehicleCategory, number> = {
  B: 4942,
  A: 1817,
  C: 6064,
  C_heavy: 9577,
  D: 5765,
  D_small: 3601,
  D_regular: 7920,
  taxi: 6166,
  tractor: 1124,
  trolleybus: 3601,
};

// Региональные коэффициенты (КТ) — ключевые регионы
const REGION_KT: Record<string, number> = {
  "77": 1.9, "99": 1.9, "97": 1.9, "177": 1.9, "197": 1.9, "199": 1.9, "777": 1.9,
  "78": 1.72, "98": 1.72, "178": 1.72,
  "50": 1.63, "90": 1.63, "150": 1.63, "190": 1.63, "750": 1.63,
  "23": 1.43, "93": 1.43, "123": 1.43,
  "16": 1.95, "116": 1.95,
  "52": 1.55, "152": 1.55,
  "54": 1.54, "154": 1.54,
  "61": 1.43, "161": 1.43, "761": 1.43,
  "63": 1.54, "163": 1.54, "763": 1.54,
  "66": 1.72, "96": 1.72, "196": 1.72,
  "74": 1.68, "174": 1.68, "774": 1.68,
  "24": 1.43, "124": 1.43,
  "25": 1.43, "125": 1.43,
  "34": 1.32, "134": 1.32,
  "01": 1.14, "02": 1.43, "03": 0.86,
  "04": 0.69, "05": 0.93, "06": 0.91,
  "07": 1.04, "08": 0.69, "09": 0.74,
  "10": 1.04, "11": 0.91, "12": 0.72,
  "13": 0.83, "14": 0.86, "15": 0.83,
  "17": 0.86, "18": 1.04, "19": 0.86,
  "20": 0.83, "21": 0.86, "22": 1.14,
  "26": 1.04, "27": 1.43, "28": 0.86,
  "29": 1.32, "30": 1.14, "31": 1.14,
  "32": 0.91, "33": 1.14, "35": 1.55,
  "36": 1.32, "37": 1.04, "38": 1.14,
  "39": 0.93, "40": 1.14, "41": 1.14,
  "42": 1.14, "43": 1.04, "44": 1.14,
  "45": 1.14, "46": 1.32, "47": 1.32,
  "48": 1.14, "49": 0.93, "51": 0.91,
  "53": 1.04, "55": 1.43, "56": 1.32,
  "57": 1.14, "58": 1.14, "59": 1.43,
  "60": 1.14, "62": 1.14, "64": 1.32,
  "65": 0.86, "67": 1.14, "68": 1.14,
  "69": 1.14, "70": 1.43, "71": 1.43,
  "72": 1.55, "73": 1.43, "75": 0.86,
  "76": 1.32, "79": 0.86, "82": 0.86,
  "83": 0.86, "86": 1.43, "87": 0.86,
  "89": 0.86, "91": 0.69, "92": 0.69,
};

// КВС — возраст/стаж
function getKvs(age: number, experience: number): number {
  if (age <= 22 && experience <= 3) return 1.93;
  if (age <= 22) return 1.66;
  if (age <= 25 && experience <= 3) return 1.79;
  if (age <= 25) return 1.04;
  if (experience <= 3) return 1.63;
  if (age <= 30) return 1.04;
  if (age <= 35) return 1.01;
  if (age <= 40) return 0.96;
  if (age <= 50) return 0.96;
  if (age <= 60) return 0.93;
  return 0.90;
}

// КБМ по классу (0-13)
const KBM_TABLE: number[] = [
  2.45, 2.30, 1.55, 1.40, 1.00, 0.95, 0.90, 0.85, 0.80, 0.75, 0.70, 0.65, 0.60, 0.50,
];

// КМ — мощность двигателя
function getKm(hp: number): number {
  if (hp <= 50) return 0.6;
  if (hp <= 70) return 1.0;
  if (hp <= 100) return 1.1;
  if (hp <= 120) return 1.2;
  if (hp <= 150) return 1.4;
  return 1.6;
}

// КС — период использования
function getKs(months: number): number {
  if (months <= 3) return 0.5;
  if (months <= 4) return 0.6;
  if (months <= 5) return 0.65;
  if (months <= 6) return 0.7;
  if (months <= 7) return 0.8;
  if (months <= 8) return 0.9;
  if (months <= 9) return 0.95;
  return 1.0;
}

export function calcOsago(input: OsagoInput): OsagoResult {
  const baseTariff = BASE_TARIFFS[input.category];
  const kt = REGION_KT[input.regionCode] ?? 1.0;
  const kvs = input.unlimitedDrivers ? 1.94 : getKvs(input.driverAge, input.driverExperience);
  const kbm = KBM_TABLE[Math.min(Math.max(input.kbmClass, 0), 13)];
  const km = input.category === "B" ? getKm(input.horsePower) : 1.0;
  const ks = getKs(input.usagePeriod);
  const ko = input.unlimitedDrivers ? 1.94 : 1.0;

  const total = Math.round(baseTariff * kt * kvs * kbm * km * ks * ko);

  return { baseTariff, kt, kvs, kbm, km, ks, ko, total };
}

export function getRegionName(code: string): string {
  return REGION_NAMES[code] ?? `Регион ${code}`;
}

export const REGION_NAMES: Record<string, string> = {
  "77": "Москва", "78": "Санкт-Петербург", "50": "Московская обл.",
  "23": "Краснодарский край", "16": "Татарстан", "52": "Нижегородская обл.",
  "54": "Новосибирская обл.", "61": "Ростовская обл.", "63": "Самарская обл.",
  "66": "Свердловская обл.", "74": "Челябинская обл.", "24": "Красноярский край",
  "25": "Приморский край", "34": "Волгоградская обл.", "72": "Тюменская обл.",
  "01": "Адыгея", "02": "Башкортостан", "03": "Бурятия", "04": "Алтай",
  "55": "Омская обл.", "59": "Пермский край", "35": "Вологодская обл.",
  "29": "Архангельская обл.", "56": "Оренбургская обл.",
};

export const POPULAR_REGIONS = [
  "77", "78", "50", "16", "23", "52", "54", "61", "63", "66", "74", "24", "25", "34", "72", "55", "59",
];
