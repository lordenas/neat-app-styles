/**
 * Калькулятор расхода топлива — типы входа/выхода.
 */

export type FuelConsumptionMode = 'consumption' | 'trip';

export interface FuelConsumptionInput {
  /** Режим: средний расход по факту или планирование поездки */
  mode: FuelConsumptionMode;
  /** Расстояние, км */
  distance: number;
  /** Израсходовано топлива, л (режим consumption) */
  fuelUsed?: number;
  /** Расход л/100км (режим trip) */
  consumptionPer100?: number;
  /** Цена за литр, ₽ */
  fuelPrice: number;
}

export interface FuelConsumptionResultConsumption {
  mode: 'consumption';
  /** Расход на 100 км, л */
  per100km: number;
  /** Стоимость поездки, ₽ */
  tripCost: number;
  /** Стоимость 1 км, ₽ */
  costPerKm: number;
}

export interface FuelConsumptionResultTrip {
  mode: 'trip';
  /** Нужно литров на поездку */
  liters: number;
  /** Стоимость поездки, ₽ */
  cost: number;
}

export type FuelConsumptionResult =
  | FuelConsumptionResultConsumption
  | FuelConsumptionResultTrip;
