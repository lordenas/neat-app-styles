import { PlanLimitsService } from './plan-limits.service';

describe('PlanLimitsService', () => {
  const service = new PlanLimitsService();

  it('returns free limits by default', () => {
    expect(service.getLimits(undefined)).toEqual({
      maxCalcs: 5,
      maxPages: 2,
      canUseBranching: false,
    });
  });

  it('returns pro_5000 unlimited-like limits', () => {
    const limits = service.getLimits('pro_5000');
    expect(limits.canUseBranching).toBe(true);
    expect(limits.maxCalcs).toBe(Number.MAX_SAFE_INTEGER);
  });
});
