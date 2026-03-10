/**
 * Данные прожиточного минимума по регионам РФ (руб./мес.)
 * Актуальные значения на 2025 год (для основных регионов).
 *
 * Категории: трудоспособное население, пенсионеры, дети.
 */

export type PmCategory = "working" | "pensioner" | "child";

export type PmData = {
  working: number;
  pensioner: number;
  child: number;
};

/** Прожиточный минимум по регионам (2025) */
export const PM_BY_REGION: Record<string, { name: string } & PmData> = {
  "00": { name: "Российская Федерация (в целом)", working: 17733, pensioner: 15048, child: 15869 },
  "77": { name: "Москва", working: 24801, pensioner: 17250, child: 19586 },
  "78": { name: "Санкт-Петербург", working: 17907, pensioner: 14415, child: 16562 },
  "50": { name: "Московская область", working: 20568, pensioner: 16033, child: 17747 },
  "23": { name: "Краснодарский край", working: 16344, pensioner: 13478, child: 14826 },
  "16": { name: "Республика Татарстан", working: 14832, pensioner: 12336, child: 13668 },
  "52": { name: "Нижегородская область", working: 15546, pensioner: 13098, child: 14490 },
  "54": { name: "Новосибирская область", working: 17244, pensioner: 14358, child: 16380 },
  "61": { name: "Ростовская область", working: 15438, pensioner: 12834, child: 14826 },
  "63": { name: "Самарская область", working: 16020, pensioner: 13230, child: 14364 },
  "66": { name: "Свердловская область", working: 16650, pensioner: 14076, child: 15834 },
  "74": { name: "Челябинская область", working: 16002, pensioner: 13464, child: 15480 },
  "24": { name: "Красноярский край", working: 18324, pensioner: 14922, child: 17478 },
  "25": { name: "Приморский край", working: 18702, pensioner: 15246, child: 18324 },
  "34": { name: "Волгоградская область", working: 14904, pensioner: 12444, child: 13668 },
  "72": { name: "Тюменская область", working: 17748, pensioner: 14616, child: 16740 },
  "55": { name: "Омская область", working: 15438, pensioner: 12798, child: 14490 },
  "59": { name: "Пермский край", working: 15978, pensioner: 13284, child: 15120 },
  "02": { name: "Республика Башкортостан", working: 14868, pensioner: 12408, child: 14040 },
  "01": { name: "Республика Адыгея", working: 14832, pensioner: 12444, child: 14040 },
  "29": { name: "Архангельская область", working: 19422, pensioner: 16002, child: 17856 },
  "35": { name: "Вологодская область", working: 16758, pensioner: 14040, child: 15876 },
  "56": { name: "Оренбургская область", working: 14904, pensioner: 12372, child: 13920 },
  "51": { name: "Мурманская область", working: 24660, pensioner: 20268, child: 23490 },
  "86": { name: "ХМАО", working: 21600, pensioner: 17190, child: 19800 },
  "89": { name: "ЯНАО", working: 24012, pensioner: 19332, child: 22176 },
};

export const PM_REGIONS = Object.entries(PM_BY_REGION).map(([code, data]) => ({
  code,
  name: data.name,
}));

/**
 * Калькулятор суммы, кратной прожиточному минимуму.
 * Используется для расчёта алиментов по ст. 83 СК РФ.
 */
export type SubsistenceMinimumInput = {
  regionCode: string;
  category: PmCategory;
  /** Кратность (например, 0.5, 1, 1.5, 2) */
  multiplier: number;
};

export type SubsistenceMinimumResult = {
  pmValue: number;
  regionName: string;
  categoryLabel: string;
  resultAmount: number;
};

const CATEGORY_LABELS: Record<PmCategory, string> = {
  working: "Трудоспособное население",
  pensioner: "Пенсионеры",
  child: "Дети",
};

export function calcSubsistenceMinimum(input: SubsistenceMinimumInput): SubsistenceMinimumResult {
  const region = PM_BY_REGION[input.regionCode] ?? PM_BY_REGION["00"];
  const pmValue = region[input.category];
  const resultAmount = Math.round(pmValue * input.multiplier * 100) / 100;

  return {
    pmValue,
    regionName: region.name,
    categoryLabel: CATEGORY_LABELS[input.category],
    resultAmount,
  };
}
