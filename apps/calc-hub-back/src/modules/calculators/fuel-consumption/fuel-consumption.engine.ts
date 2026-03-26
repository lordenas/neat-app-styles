/**
 * Калькулятор расхода топлива.
 * Порт из neat-app-styles/src/lib/calculators/fuel-consumption.ts
 */

export interface FuelInput {
  distance: number;
  fuelUsed: number;
  fuelPrice: number;
}

export interface FuelResult {
  per100km: number;
  tripCost: number;
  costPerKm: number;
}

export function calcFuelConsumption(input: FuelInput): FuelResult {
  if (input.distance <= 0) {
    return { per100km: 0, tripCost: 0, costPerKm: 0 };
  }
  const per100km =
    Math.round((input.fuelUsed / input.distance) * 100 * 100) / 100;
  const tripCost = Math.round(input.fuelUsed * input.fuelPrice * 100) / 100;
  const costPerKm = Math.round((tripCost / input.distance) * 100) / 100;
  return { per100km, tripCost, costPerKm };
}

export function calcFuelNeeded(
  distance: number,
  consumptionPer100: number,
  fuelPrice: number,
): { liters: number; cost: number } {
  const liters = Math.round((consumptionPer100 / 100) * distance * 100) / 100;
  const cost = Math.round(liters * fuelPrice * 100) / 100;
  return { liters, cost };
}
