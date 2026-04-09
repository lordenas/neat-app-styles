/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { CalculatorsService } from './calculators.service';

describe('CalculatorsService', () => {
  it('getAvailableTypes returns sorted unique calculator types', async () => {
    const dbService = {
      db: {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest
              .fn()
              .mockResolvedValue([
                { calculatorType: 'osago' },
                { calculatorType: 'vat' },
                { calculatorType: 'vat' },
              ]),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          values: jest.fn().mockResolvedValue(undefined),
        }),
      },
    } as any;
    const service = new CalculatorsService(dbService);

    const types = await service.getAvailableTypes();

    expect(types).toEqual(['osago', 'vat']);
  });

  it('trackUsage inserts api usage record', async () => {
    const valuesMock = jest.fn().mockResolvedValue(undefined);
    const insertMock = jest.fn().mockReturnValue({ values: valuesMock });
    const dbService = {
      db: { insert: insertMock },
      periodKey: '2026-02',
    } as any;
    const service = new CalculatorsService(dbService);

    await service.trackUsage(
      'key-id',
      'user-id',
      '/api/v1/calculate/osago',
      '127.0.0.1',
    );

    expect(insertMock).toHaveBeenCalled();
    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKeyId: 'key-id',
        userId: 'user-id',
        endpoint: '/api/v1/calculate/osago',
        ipAddress: '127.0.0.1',
      }),
    );
  });
});
