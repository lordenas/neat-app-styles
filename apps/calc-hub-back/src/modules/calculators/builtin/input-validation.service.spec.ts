/* eslint-disable @typescript-eslint/no-unsafe-assignment -- test file: getResponse() and DTO casts */
import { BadRequestException } from '@nestjs/common';
import { InputValidationService } from './input-validation.service';
import { OsagoCalculateInputDto } from '../dto/osago-calculate-input.dto';

describe('InputValidationService', () => {
  let service: InputValidationService;

  beforeEach(() => {
    service = new InputValidationService();
  });

  it('validateAndTransform returns instance for valid input', async () => {
    const raw = {
      category: 'B',
      horsePower: 120,
      regionCode: '77',
      driverAge: 35,
      driverExperience: 10,
      kbmClass: 4,
      usagePeriod: 12,
      unlimitedDrivers: false,
    };
    const result = await service.validateAndTransform(
      OsagoCalculateInputDto,
      raw,
    );
    expect(result).toBeDefined();
    expect((result as { category: string }).category).toBe('B');
  });

  it('validateAndTransform throws BadRequestException with message array for invalid input', async () => {
    const raw = {
      category: 'B',
      horsePower: -1,
      regionCode: '77',
      driverAge: 35,
      driverExperience: 10,
      kbmClass: 4,
      usagePeriod: 12,
      unlimitedDrivers: false,
    };
    await expect(
      service.validateAndTransform(OsagoCalculateInputDto, raw),
    ).rejects.toThrow(BadRequestException);
    try {
      await service.validateAndTransform(OsagoCalculateInputDto, raw);
    } catch (e: unknown) {
      if (e instanceof BadRequestException) {
        const response = e.getResponse() as {
          error: string;
          message: string[];
        };
        expect(response).toMatchObject({
          error: 'Bad Request',
          message: expect.any(Array),
        });
      }
    }
  });
});
