/**
 * ОСАГО — типы входа/выхода расчёта по коэффициентам ЦБ РФ (2024–2025).
 */

export type VehicleCategory =
  | 'B'
  | 'A'
  | 'C'
  | 'C_heavy'
  | 'D'
  | 'D_small'
  | 'D_regular'
  | 'taxi'
  | 'tractor'
  | 'trolleybus';

export interface OsagoInput {
  category: VehicleCategory;
  horsePower: number;
  regionCode: string;
  driverAge: number;
  driverExperience: number;
  kbmClass: number;
  usagePeriod: number;
  unlimitedDrivers: boolean;
}

export interface OsagoResult {
  baseTariff: number;
  kt: number;
  kvs: number;
  kbm: number;
  km: number;
  ks: number;
  ko: number;
  total: number;
}

export interface OsagoEngineInput extends OsagoInput {
  /** Базовый тариф в коридоре ЦБ (приоритет над серединой коридора). */
  baseTariff?: number;
  /** @deprecated используйте baseTariff */
  customBaseTariff?: number;
}
