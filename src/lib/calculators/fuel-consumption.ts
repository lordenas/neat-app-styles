/**
 * Калькулятор расхода топлива.
 */

export type FuelInput = {
  /** Расстояние (км) */
  distance: number;
  /** Объём израсходованного топлива (л) */
  fuelUsed: number;
  /** Цена за литр */
  fuelPrice: number;
};

export type FuelResult = {
  /** Расход на 100 км (л) */
  per100km: number;
  /** Стоимость поездки */
  tripCost: number;
  /** Стоимость на 1 км */
  costPerKm: number;
};

export function calcFuelConsumption(input: FuelInput): FuelResult {
  if (input.distance <= 0) {
    return { per100km: 0, tripCost: 0, costPerKm: 0 };
  }
  const per100km = Math.round((input.fuelUsed / input.distance) * 100 * 100) / 100;
  const tripCost = Math.round(input.fuelUsed * input.fuelPrice * 100) / 100;
  const costPerKm = Math.round((tripCost / input.distance) * 100) / 100;

  return { per100km, tripCost, costPerKm };
}

/**
 * Обратный расчёт: сколько топлива нужно на расстояние при известном расходе.
 */
export function calcFuelNeeded(distance: number, consumptionPer100: number, fuelPrice: number) {
  const liters = Math.round((consumptionPer100 / 100) * distance * 100) / 100;
  const cost = Math.round(liters * fuelPrice * 100) / 100;
  return { liters, cost };
}
