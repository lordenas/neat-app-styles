export type VehicleCategory =
  | 'passenger_car'
  | 'motorcycle'
  | 'bus'
  | 'truck'
  | 'snowmobile'
  | 'boat'
  | 'yacht'
  | 'jetski'
  | 'towed_vessel'
  | 'aircraft_engine'
  | 'jet_aircraft'
  | 'other_no_engine'
  | 'other_self_propelled';

export interface TransportTaxInput {
  horsePower: number;
  vehicleCategory: VehicleCategory;
  regionCode: string;
  ownershipMonths: number;
  carPrice: number;
  carYear: number;
  taxYear: number;
}

export interface TransportTaxResult {
  baseRate: number;
  regionalRate: number;
  luxuryMultiplier: number;
  ownershipCoeff: number;
  taxAmount: number;
}
