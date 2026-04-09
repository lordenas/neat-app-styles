import { Injectable } from '@nestjs/common';

export interface BuilderPlanLimits {
  maxCalcs: number;
  maxPages: number;
  canUseBranching: boolean;
}

@Injectable()
export class PlanLimitsService {
  getLimits(subscriptionPlan: string | null | undefined): BuilderPlanLimits {
    switch (subscriptionPlan) {
      case 'pro_5000':
        return {
          maxCalcs: Number.MAX_SAFE_INTEGER,
          maxPages: Number.MAX_SAFE_INTEGER,
          canUseBranching: true,
        };
      case 'pro_1000':
        return { maxCalcs: 50, maxPages: 10, canUseBranching: true };
      case 'pro_500':
        return { maxCalcs: 20, maxPages: 5, canUseBranching: true };
      case 'free':
      default:
        return { maxCalcs: 5, maxPages: 2, canUseBranching: false };
    }
  }
}
