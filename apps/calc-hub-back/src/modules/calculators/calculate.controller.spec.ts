/* eslint-disable @typescript-eslint/unbound-method -- Jest mock assertions */
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeysService } from '../api-keys/api-keys.service';
import { OsagoHandler } from './builtin/handlers/osago.handler';
import { AutoLoanHandler } from './builtin/handlers/auto-loan.handler';
import { CreditEarlyRepaymentHandler } from './builtin/handlers/credit-early-repayment.handler';
import { DepositHandler } from './builtin/handlers/deposit.handler';
import { FuelConsumptionHandler } from './builtin/handlers/fuel-consumption.handler';
import { InsuranceTenureHandler } from './builtin/handlers/insurance-tenure.handler';
import { LoanInterestHandler } from './builtin/handlers/loan-interest.handler';
import { MicroloanHandler } from './builtin/handlers/microloan.handler';
import { MortgageHandler } from './builtin/handlers/mortgage.handler';
import { NdflHandler } from './builtin/handlers/ndfl.handler';
import { OtpusknyeHandler } from './builtin/handlers/otpusknye.handler';
import { PenaltyContractHandler } from './builtin/handlers/penalty-contract.handler';
import { PeniHandler } from './builtin/handlers/peni.handler';
import { PropertyDeductionHandler } from './builtin/handlers/property-deduction.handler';
import { PropertySaleTaxHandler } from './builtin/handlers/property-sale-tax.handler';
import { RefinancingHandler } from './builtin/handlers/refinancing.handler';
import { TransportTaxHandler } from './builtin/handlers/transport-tax.handler';
import { UnusedVacationHandler } from './builtin/handlers/unused-vacation.handler';
import { RastamozhkaHandler } from './builtin/handlers/rastamozhka.handler';
import { CalculateController } from './calculate.controller';
import { CalculatorsService } from './calculators.service';

describe('CalculateController', () => {
  let controller: CalculateController;
  let apiKeysService: jest.Mocked<ApiKeysService>;
  let calculatorsService: jest.Mocked<CalculatorsService>;
  let osagoHandler: jest.Mocked<OsagoHandler>;
  let autoLoanHandler: jest.Mocked<AutoLoanHandler>;
  let creditEarlyRepaymentHandler: jest.Mocked<CreditEarlyRepaymentHandler>;
  let depositHandler: jest.Mocked<DepositHandler>;
  let fuelConsumptionHandler: jest.Mocked<FuelConsumptionHandler>;
  let insuranceTenureHandler: jest.Mocked<InsuranceTenureHandler>;
  let loanInterestHandler: jest.Mocked<LoanInterestHandler>;
  let microloanHandler: jest.Mocked<MicroloanHandler>;
  let mortgageHandler: jest.Mocked<MortgageHandler>;
  let ndflHandler: jest.Mocked<NdflHandler>;
  let otpusknyeHandler: jest.Mocked<OtpusknyeHandler>;
  let penaltyContractHandler: jest.Mocked<PenaltyContractHandler>;
  let peniHandler: jest.Mocked<PeniHandler>;
  let propertyDeductionHandler: jest.Mocked<PropertyDeductionHandler>;
  let propertySaleTaxHandler: jest.Mocked<PropertySaleTaxHandler>;
  let refinancingHandler: jest.Mocked<RefinancingHandler>;
  let transportTaxHandler: jest.Mocked<TransportTaxHandler>;
  let unusedVacationHandler: jest.Mocked<UnusedVacationHandler>;
  let rastamozhkaHandler: jest.Mocked<RastamozhkaHandler>;

  const validResolvedKey = { apiKeyId: 'key-id', userId: 'user-id' };

  beforeEach(async () => {
    apiKeysService = {
      resolveByRawKey: jest.fn().mockResolvedValue(validResolvedKey),
    } as unknown as jest.Mocked<ApiKeysService>;
    calculatorsService = {
      trackUsage: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<CalculatorsService>;
    osagoHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'osago',
        result: { total: 10000 },
      }),
    } as unknown as jest.Mocked<OsagoHandler>;
    autoLoanHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'auto-loan',
        result: { monthlyPayment: 35000, loanAmount: 1600000 },
      }),
    } as unknown as jest.Mocked<AutoLoanHandler>;
    creditEarlyRepaymentHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'credit-early-repayment',
        result: { baseMonthlyPayment: 75000, totalInterest: 1e6 },
      }),
    } as unknown as jest.Mocked<CreditEarlyRepaymentHandler>;
    depositHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'deposit',
        result: {
          totalInterest: 195618,
          finalBalance: 1195618,
          totalReturn: 1195618,
          totalTax: 2030,
        },
      }),
    } as unknown as jest.Mocked<DepositHandler>;
    fuelConsumptionHandler = {
      calculate: jest.fn().mockImplementation((input: { mode?: string }) => {
        if (input?.mode === 'trip') {
          return Promise.resolve({
            formulaVersion: 'fuel-consumption',
            result: { mode: 'trip', liters: 24, cost: 1344 },
          });
        }
        return Promise.resolve({
          formulaVersion: 'fuel-consumption',
          result: {
            mode: 'consumption',
            per100km: 8,
            tripCost: 2240,
            costPerKm: 4.48,
          },
        });
      }),
    } as unknown as jest.Mocked<FuelConsumptionHandler>;
    insuranceTenureHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'insurance-tenure',
        result: {
          totalYears: 9,
          totalMonths: 9,
          totalDays: 15,
          rawDays: 3581,
          sickPayPercent: 100,
          sickPayDescription: 'Стаж 8+ лет — 100% среднего заработка',
        },
      }),
    } as unknown as jest.Mocked<InsuranceTenureHandler>;
    loanInterestHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'loan-interest',
        result: {
          totalInterest: 50684.93,
          totalDebtAndInterest: 550684.93,
          totalDays: 365,
          rows: [
            {
              type: 'period',
              periodIndex: 1,
              dateFrom: '2025-02-28',
              dateTo: '2026-02-27',
              principal: 500000,
              days: 365,
              ratePercent: 10,
              periodInterest: 50684.93,
              cumulativeInterest: 50684.93,
            },
          ],
        },
      }),
    } as unknown as jest.Mocked<LoanInterestHandler>;
    microloanHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'microloan',
        result: {
          interestAccrued: 7200,
          totalToRepay: 37200,
          overdueInterest: 0,
          overdueTotal: 0,
          grandTotal: 37200,
          dailyAccrual: [{ day: 1, interest: 240, total: 30240 }],
        },
      }),
    } as unknown as jest.Mocked<MicroloanHandler>;
    mortgageHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'mortgage',
        result: {
          principal: 8000000,
          monthlyPayment: 115992.93,
          totalPayment: 27838303.2,
          totalInterest: 19838303.2,
          termMonths: 240,
        },
      }),
    } as unknown as jest.Mocked<MortgageHandler>;
    ndflHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'ndfl',
        result: { gross: 100000, tax: 13000, net: 87000, effectiveRate: 13 },
      }),
    } as unknown as jest.Mocked<NdflHandler>;
    otpusknyeHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'otpusknye',
        result: {
          avgDailyPay: 2452.05,
          calcDays: 293.7,
          vacationPay: 68657.4,
          ndfl: 8925.46,
          netPay: 59731.94,
        },
      }),
    } as unknown as jest.Mocked<OtpusknyeHandler>;
    penaltyContractHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'penalty-contract',
        result: {
          totalPenalty: 13500,
          totalPenaltyCapped: 13500,
          limitApplied: null,
          totalDebtAndPenalty: 513500,
          breakdown: [],
        },
      }),
    } as unknown as jest.Mocked<PenaltyContractHandler>;
    peniHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'peni',
        result: {
          totalDays: 31,
          totalPeni: 1341.67,
          breakdown: [],
        },
      }),
    } as unknown as jest.Mocked<PeniHandler>;
    propertyDeductionHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'property-deduction',
        result: {
          unusedDeduction: 2000000,
          taxToReturn: 260000,
          totalNdflEntered: 468000,
          availableFromEnteredYears: 260000,
          remainingForFutureYears: 0,
          yearsWithIncome: [2022, 2023, 2024],
          isFullyBlocked: false,
        },
      }),
    } as unknown as jest.Mocked<PropertyDeductionHandler>;
    propertySaleTaxHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'property-sale-tax',
        result: {
          taxableIncome: 8000000,
          taxableBase: 7000000,
          tax: 910000,
          minPeriodYears: 5,
          noTax: false,
          explanation: 'Фактический срок владения…',
        },
      }),
    } as unknown as jest.Mocked<PropertySaleTaxHandler>;
    refinancingHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'refinancing',
        result: {
          currentMonthlyPayment: 75028.52,
          refinancedMonthlyPayment: 59726.42,
          currentTotalInterest: 8505134,
          refinancedTotalInterest: 5750756,
          totalInterestDelta: -2754378,
          monthlyPaymentDelta: -15302.1,
          scheduleData: [],
        },
      }),
    } as unknown as jest.Mocked<RefinancingHandler>;
    transportTaxHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'transport-tax',
        result: {
          baseRate: 5,
          regionalRate: 25,
          luxuryMultiplier: 1,
          ownershipCoeff: 1,
          taxAmount: 18750,
        },
      }),
    } as unknown as jest.Mocked<TransportTaxHandler>;
    unusedVacationHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'unused-vacation',
        result: {
          workedMonths: 13,
          excludedDays: 0,
          earnedDays: 28,
          unusedDays: 28,
          compensation: 57344,
          ndfl: 7454.72,
          netPay: 49889.28,
        },
      }),
    } as unknown as jest.Mocked<UnusedVacationHandler>;
    rastamozhkaHandler = {
      calculate: jest.fn().mockResolvedValue({
        formulaVersion: 'rastamozhka-auto',
        result: {
          customsFee: 4924,
          duty: 567000,
          recyclingFee: 480200,
          excise: 91950,
          vat: 0,
          total: 1126074,
          totalRub: 1126074,
          dutyNote: '€2.7/см³',
        },
      }),
    } as unknown as jest.Mocked<RastamozhkaHandler>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalculateController],
      providers: [
        { provide: CalculatorsService, useValue: calculatorsService },
        { provide: ApiKeysService, useValue: apiKeysService },
        { provide: OsagoHandler, useValue: osagoHandler },
        { provide: AutoLoanHandler, useValue: autoLoanHandler },
        {
          provide: CreditEarlyRepaymentHandler,
          useValue: creditEarlyRepaymentHandler,
        },
        { provide: DepositHandler, useValue: depositHandler },
        { provide: FuelConsumptionHandler, useValue: fuelConsumptionHandler },
        {
          provide: InsuranceTenureHandler,
          useValue: insuranceTenureHandler,
        },
        { provide: LoanInterestHandler, useValue: loanInterestHandler },
        { provide: MicroloanHandler, useValue: microloanHandler },
        { provide: MortgageHandler, useValue: mortgageHandler },
        { provide: NdflHandler, useValue: ndflHandler },
        { provide: OtpusknyeHandler, useValue: otpusknyeHandler },
        { provide: PenaltyContractHandler, useValue: penaltyContractHandler },
        { provide: PeniHandler, useValue: peniHandler },
        {
          provide: PropertyDeductionHandler,
          useValue: propertyDeductionHandler,
        },
        {
          provide: PropertySaleTaxHandler,
          useValue: propertySaleTaxHandler,
        },
        { provide: RefinancingHandler, useValue: refinancingHandler },
        {
          provide: TransportTaxHandler,
          useValue: transportTaxHandler,
        },
        {
          provide: UnusedVacationHandler,
          useValue: unusedVacationHandler,
        },
        {
          provide: RastamozhkaHandler,
          useValue: rastamozhkaHandler,
        },
      ],
    }).compile();

    controller = module.get(CalculateController);
  });

  describe('auth', () => {
    it('throws when x-api-key is missing', async () => {
      await expect(
        controller.calculateOsago(
          { regionCode: '77', input: {} },
          '',
          '127.0.0.1',
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(
        jest.mocked(apiKeysService.resolveByRawKey),
      ).not.toHaveBeenCalled();
    });

    it('throws when x-api-key is invalid', async () => {
      apiKeysService.resolveByRawKey.mockResolvedValue(null);
      await expect(
        controller.calculateOsago(
          { regionCode: '77', input: {} },
          'bad-key',
          '127.0.0.1',
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(jest.mocked(calculatorsService.trackUsage)).not.toHaveBeenCalled();
    });
  });

  describe('POST /osago', () => {
    it('calls osagoHandler and returns result', async () => {
      const body = {
        regionCode: '77',
        input: {
          category: 'B',
          horsePower: 120,
          regionCode: '77',
          driverAge: 35,
          driverExperience: 10,
          kbmClass: 4,
          usagePeriod: 12,
          unlimitedDrivers: false,
        },
      };
      const res = await controller.calculateOsago(body, 'key', '127.0.0.1');
      expect(res.calculator).toBe('osago');
      expect(res.region).toBe('77');
      expect(res.formulaVersion).toBe('osago');
      expect(res.result).toEqual({ total: 10000 });
      expect(jest.mocked(osagoHandler.calculate)).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'osago', regionCode: '77' }),
      );
      expect(jest.mocked(calculatorsService.trackUsage)).toHaveBeenCalledWith(
        'key-id',
        'user-id',
        '/api/v1/calculate/osago',
        '127.0.0.1',
      );
    });
  });

  describe('POST /auto-loan', () => {
    it('calls autoLoanHandler and returns result', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          carPrice: 2e6,
          downPayment: 400e3,
          annualRate: 12,
          termMonths: 60,
        },
      };
      const res = await controller.calculateAutoLoan(body, 'key', '127.0.0.1');
      expect(res.calculator).toBe('auto-loan');
      expect(res.formulaVersion).toBe('auto-loan');
      expect(res.result).toMatchObject({
        monthlyPayment: 35000,
        loanAmount: 1600000,
      });
      expect(jest.mocked(autoLoanHandler.calculate)).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'auto-loan' }),
      );
    });
  });

  describe('POST /credit-early-repayment', () => {
    it('calls creditEarlyRepaymentHandler and returns result', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          loanAmount: 5e6,
          annualRatePercent: 18,
          termMonths: 180,
          issueDate: '2026-02-22',
        },
      };
      const res = await controller.calculateCreditEarlyRepayment(
        body,
        'key',
        '127.0.0.1',
      );
      expect(res.calculator).toBe('credit-early-repayment');
      expect(res.formulaVersion).toBe('credit-early-repayment');
      expect(res.result).toMatchObject({
        baseMonthlyPayment: 75000,
        totalInterest: 1e6,
      });
      expect(
        jest.mocked(creditEarlyRepaymentHandler.calculate),
      ).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'credit-early-repayment' }),
      );
    });
  });

  describe('POST /deposit', () => {
    it('calls depositHandler and returns result', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          principal: 1_000_000,
          startDate: '2026-02-27',
          term: 12,
          termUnit: 'months',
          annualRatePercent: 18,
          capitalization: true,
          compoundFrequency: '1M',
          payoutFrequency: 'end',
        },
      };
      const res = await controller.calculateDeposit(body, 'key', '127.0.0.1');
      expect(res.calculator).toBe('deposit');
      expect(res.formulaVersion).toBe('deposit');
      expect(res.result).toMatchObject({
        totalInterest: 195618,
        finalBalance: 1195618,
        totalReturn: 1195618,
        totalTax: 2030,
      });
      expect(jest.mocked(depositHandler.calculate)).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'deposit' }),
      );
    });
  });

  describe('POST /fuel-consumption', () => {
    it('calls fuelConsumptionHandler and returns result for mode=consumption', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          mode: 'consumption',
          distance: 500,
          fuelUsed: 40,
          fuelPrice: 56,
        },
      };
      const res = await controller.calculateFuelConsumption(
        body,
        'key',
        '127.0.0.1',
      );
      expect(res.calculator).toBe('fuel-consumption');
      expect(res.formulaVersion).toBe('fuel-consumption');
      expect(res.result).toMatchObject({
        mode: 'consumption',
        per100km: 8,
        tripCost: 2240,
        costPerKm: 4.48,
      });
      expect(
        jest.mocked(fuelConsumptionHandler.calculate),
      ).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'fuel-consumption' }),
      );
    });

    it('calls fuelConsumptionHandler and returns result for mode=trip', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          mode: 'trip',
          distance: 300,
          consumptionPer100: 8,
          fuelPrice: 56,
        },
      };
      const res = await controller.calculateFuelConsumption(
        body,
        'key',
        '127.0.0.1',
      );
      expect(res.calculator).toBe('fuel-consumption');
      expect(res.result).toMatchObject({
        mode: 'trip',
        liters: 24,
        cost: 1344,
      });
    });
  });

  describe('POST /insurance-tenure', () => {
    it('calls insuranceTenureHandler and returns result', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          periods: [
            { startDate: '2015-03-01', endDate: '2020-06-15' },
            { startDate: '2020-09-01', endDate: '2025-01-31' },
          ],
        },
      };
      const res = await controller.calculateInsuranceTenure(
        body,
        'key',
        '127.0.0.1',
      );
      expect(res.calculator).toBe('insurance-tenure');
      expect(res.formulaVersion).toBe('insurance-tenure');
      expect(res.result).toMatchObject({
        totalYears: 9,
        totalMonths: 9,
        totalDays: 15,
        rawDays: 3581,
        sickPayPercent: 100,
      });
      expect(
        jest.mocked(insuranceTenureHandler.calculate),
      ).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'insurance-tenure' }),
      );
    });
  });

  describe('POST /loan-interest', () => {
    it('calls loanInterestHandler and returns result', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          principal: 500_000,
          startDate: '2025-02-27',
          endDate: '2026-02-27',
          initialRatePercent: 10,
        },
      };
      const res = await controller.calculateLoanInterest(
        body,
        'key',
        '127.0.0.1',
      );
      expect(res.calculator).toBe('loan-interest');
      expect(res.formulaVersion).toBe('loan-interest');
      expect(res.result).toMatchObject({
        totalInterest: 50684.93,
        totalDebtAndInterest: 550684.93,
        totalDays: 365,
      });
      expect(jest.mocked(loanInterestHandler.calculate)).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'loan-interest' }),
      );
    });
  });

  describe('POST /microloan', () => {
    it('calls microloanHandler and returns result', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          amount: 30_000,
          termDays: 30,
          rate: 0.8,
          rateUnit: 'day',
          hasOverdue: false,
          overduePeriod: 10,
          overdueUnit: 'days',
          overdueRate: 2,
          overdueRateUnit: 'day',
          penaltyAmount: 0,
        },
      };
      const res = await controller.calculateMicroloan(body, 'key', '127.0.0.1');
      expect(res.calculator).toBe('microloan');
      expect(res.formulaVersion).toBe('microloan');
      expect(res.result).toMatchObject({
        interestAccrued: 7200,
        totalToRepay: 37200,
        overdueInterest: 0,
        grandTotal: 37200,
      });
      expect(jest.mocked(microloanHandler.calculate)).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'microloan' }),
      );
    });
  });

  describe('POST /mortgage', () => {
    it('calls mortgageHandler and returns result', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          propertyPrice: 10_000_000,
          downPayment: 2_000_000,
          annualRate: 18,
          termYears: 20,
        },
      };
      const res = await controller.calculateMortgage(body, 'key', '127.0.0.1');
      expect(res.calculator).toBe('mortgage');
      expect(res.formulaVersion).toBe('mortgage');
      expect(res.result).toMatchObject({
        principal: 8000000,
        monthlyPayment: 115992.93,
        totalPayment: 27838303.2,
        totalInterest: 19838303.2,
        termMonths: 240,
      });
      expect(jest.mocked(mortgageHandler.calculate)).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'mortgage' }),
      );
    });
  });

  describe('POST /ndfl', () => {
    it('calls ndflHandler and returns result', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          income: 100_000,
          incomeType: 'salary',
          isNonResident: false,
          direction: 'fromGross',
        },
      };
      const res = await controller.calculateNdfl(body, 'key', '127.0.0.1');
      expect(res.calculator).toBe('ndfl');
      expect(res.formulaVersion).toBe('ndfl');
      expect(res.result).toMatchObject({
        gross: 100000,
        tax: 13000,
        net: 87000,
        effectiveRate: 13,
      });
      expect(jest.mocked(ndflHandler.calculate)).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'ndfl' }),
      );
    });
  });

  describe('POST /otpusknye', () => {
    it('calls otpusknyeHandler and returns result', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          totalEarnings: 720_000,
          fullMonths: 10,
          partialMonths: [
            { excludedDays: 10, totalDaysInMonth: 31 },
            { excludedDays: 5, totalDaysInMonth: 30 },
          ],
          vacationDays: 28,
        },
      };
      const res = await controller.calculateOtpusknye(body, 'key', '127.0.0.1');
      expect(res.calculator).toBe('otpusknye');
      expect(res.formulaVersion).toBe('otpusknye');
      expect(res.result).toMatchObject({
        avgDailyPay: 2452.05,
        calcDays: 293.7,
        vacationPay: 68657.4,
        ndfl: 8925.46,
        netPay: 59731.94,
      });
      expect(jest.mocked(otpusknyeHandler.calculate)).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'otpusknye' }),
      );
    });
  });

  describe('POST /penalty-contract', () => {
    it('calls penaltyContractHandler and returns result', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          sum: 500_000,
          startDate: '2025-01-01',
          endDate: '2025-02-27',
          workdaysOnly: false,
          rateType: 'percent_per_day',
          rateValue: 0.1,
          excludedPeriods: [],
          partialPayments: [],
          additionalDebts: [],
        },
      };
      const res = await controller.calculatePenaltyContract(
        body,
        'key',
        '127.0.0.1',
      );
      expect(res.calculator).toBe('penalty-contract');
      expect(res.formulaVersion).toBe('penalty-contract');
      expect(res.result).toMatchObject({
        totalPenalty: 13500,
        totalPenaltyCapped: 13500,
        limitApplied: null,
        totalDebtAndPenalty: 513500,
      });
      expect(
        jest.mocked(penaltyContractHandler.calculate),
      ).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'penalty-contract' }),
      );
    });
  });

  describe('POST /peni', () => {
    it('calls peniHandler and returns result', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          debt: 100_000,
          calcType: 'tax',
          payerType: 'individual',
          dateFrom: '2025-01-27',
          dateTo: '2025-02-27',
        },
      };
      const res = await controller.calculatePeni(body, 'key', '127.0.0.1');
      expect(res.calculator).toBe('peni');
      expect(res.formulaVersion).toBe('peni');
      expect(res.result).toMatchObject({
        totalDays: 31,
        totalPeni: 1341.67,
      });
      expect(jest.mocked(peniHandler.calculate)).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'peni' }),
      );
    });
  });

  describe('POST /property-deduction', () => {
    it('calls propertyDeductionHandler and returns result', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          propertyPrice: 10_000_000,
          purchaseYear: 2024,
          incomeByYear: { 2022: 1_200_000, 2023: 1_200_000, 2024: 1_200_000 },
          usedPreviously: false,
        },
      };
      const res = await controller.calculatePropertyDeduction(
        body,
        'key',
        '127.0.0.1',
      );
      expect(res.calculator).toBe('property-deduction');
      expect(res.formulaVersion).toBe('property-deduction');
      expect(res.result).toMatchObject({
        unusedDeduction: 2000000,
        taxToReturn: 260000,
        availableFromEnteredYears: 260000,
        isFullyBlocked: false,
      });
      expect(
        jest.mocked(propertyDeductionHandler.calculate),
      ).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'property-deduction' }),
      );
    });
  });

  describe('POST /property-sale-tax', () => {
    it('calls propertySaleTaxHandler and returns result', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          ownershipBefore2016: false,
          acquisitionType: 'purchase',
          yearsHeld: 2,
          salePrice: 8_000_000,
          cadastralValue: 7_000_000,
          coefficient: 0.7,
          useFixedDeduction: true,
          saleAfter2025: true,
        },
      };
      const res = await controller.calculatePropertySaleTax(
        body,
        'key',
        '127.0.0.1',
      );
      expect(res.calculator).toBe('property-sale-tax');
      expect(res.formulaVersion).toBe('property-sale-tax');
      expect(res.result).toMatchObject({
        taxableIncome: 8000000,
        taxableBase: 7000000,
        tax: 910000,
        minPeriodYears: 5,
        noTax: false,
      });
      expect(
        jest.mocked(propertySaleTaxHandler.calculate),
      ).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'property-sale-tax' }),
      );
    });
  });

  describe('POST /refinancing', () => {
    it('calls refinancingHandler and returns result', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          remainingDebt: 5_000_000,
          remainingTerm: 15,
          remainingTermUnit: 'years',
          currentRate: 18,
          newRate: 14,
          newTerm: 15,
          newTermUnit: 'years',
        },
      };
      const res = await controller.calculateRefinancing(
        body,
        'key',
        '127.0.0.1',
      );
      expect(res.calculator).toBe('refinancing');
      expect(res.formulaVersion).toBe('refinancing');
      expect(res.result).toMatchObject({
        currentMonthlyPayment: 75028.52,
        refinancedMonthlyPayment: 59726.42,
        totalInterestDelta: -2754378,
        monthlyPaymentDelta: -15302.1,
      });
      expect(jest.mocked(refinancingHandler.calculate)).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'refinancing' }),
      );
    });
  });

  describe('POST /transport-tax', () => {
    it('calls transportTaxHandler and returns result', async () => {
      const body = {
        regionCode: '77',
        input: {
          horsePower: 150,
          vehicleCategory: 'passenger_car',
          regionCode: '77',
          ownershipMonths: 12,
          carPrice: 2_000_000,
          carYear: 2020,
          taxYear: 2024,
        },
      };
      const res = await controller.calculateTransportTax(
        body,
        'key',
        '127.0.0.1',
      );
      expect(res.calculator).toBe('transport-tax');
      expect(res.formulaVersion).toBe('transport-tax');
      expect(res.result).toMatchObject({
        baseRate: 5,
        regionalRate: 25,
        taxAmount: 18750,
      });
      expect(jest.mocked(transportTaxHandler.calculate)).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'transport-tax' }),
      );
    });
  });

  describe('POST /unused-vacation', () => {
    it('calls unusedVacationHandler and returns result', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          avgDailyPay: 2048,
          startDate: '2024-01-01',
          endDate: '2025-02-27',
          annualVacationDays: 28,
          usedVacationDays: 0,
          excludedPeriods: [],
        },
      };
      const res = await controller.calculateUnusedVacation(
        body,
        'key',
        '127.0.0.1',
      );
      expect(res.calculator).toBe('unused-vacation');
      expect(res.formulaVersion).toBe('unused-vacation');
      expect(res.result).toMatchObject({
        workedMonths: 13,
        earnedDays: 28,
        unusedDays: 28,
        compensation: 57344,
        ndfl: 7454.72,
        netPay: 49889.28,
      });
      expect(jest.mocked(unusedVacationHandler.calculate)).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'unused-vacation' }),
      );
    });
  });

  describe('POST /rastamozhka-auto', () => {
    it('calls rastamozhkaHandler and returns result', async () => {
      const body = {
        regionCode: 'GLB',
        input: {
          priceEur: 25_000,
          engineVolume: 2000,
          horsePower: 150,
          engineType: 'petrol',
          ageGroup: '3-5',
          importerType: 'individual',
          eurRate: 105,
        },
      };
      const res = await controller.calculateRastamozhka(
        body,
        'key',
        '127.0.0.1',
      );
      expect(res.calculator).toBe('rastamozhka-auto');
      expect(res.formulaVersion).toBe('rastamozhka-auto');
      expect(res.result).toMatchObject({
        customsFee: 4924,
        duty: 567000,
        total: 1126074,
        dutyNote: '€2.7/см³',
      });
      expect(jest.mocked(rastamozhkaHandler.calculate)).toHaveBeenCalledWith(
        body.input,
        expect.objectContaining({ calculatorSlug: 'rastamozhka-auto' }),
      );
    });
  });
});
