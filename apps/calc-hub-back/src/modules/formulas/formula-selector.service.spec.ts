/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { NotFoundException } from '@nestjs/common';
import { FormulaSelectorService } from './formula-selector.service';

describe('FormulaSelectorService', () => {
  it('returns active formula when found', async () => {
    const dbService = {
      db: {
        query: {
          formulas: {
            findFirst: jest.fn().mockResolvedValue({
              id: 'formula-id',
              version: '1.0.0',
            }),
          },
        },
      },
    } as any;
    const service = new FormulaSelectorService(dbService);

    const result = await service.getActiveFormula({
      calculatorId: 'calc-id',
      regionId: 'region-id',
      calculationDate: new Date(),
    });

    expect(result.version).toBe('1.0.0');
  });

  it('throws when no formula found', async () => {
    const dbService = {
      db: {
        query: {
          formulas: {
            findFirst: jest.fn().mockResolvedValue(null),
          },
        },
      },
    } as any;
    const service = new FormulaSelectorService(dbService);

    await expect(
      service.getActiveFormula({
        calculatorId: 'calc-id',
        regionId: 'region-id',
        calculationDate: new Date(),
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
