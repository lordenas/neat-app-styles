import {
  Body,
  Controller,
  Headers,
  Ip,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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
import { CalculateRequestDto } from './dto/calculate-request.dto';
import type { CalculationResponse } from './calculators.service';
import { CalculatorsService } from './calculators.service';

@ApiTags('Calculators')
@Controller('v1/calculate')
export class CalculateController {
  constructor(
    private readonly calculatorsService: CalculatorsService,
    private readonly apiKeysService: ApiKeysService,
    private readonly osagoHandler: OsagoHandler,
    private readonly autoLoanHandler: AutoLoanHandler,
    private readonly creditEarlyRepaymentHandler: CreditEarlyRepaymentHandler,
    private readonly depositHandler: DepositHandler,
    private readonly fuelConsumptionHandler: FuelConsumptionHandler,
    private readonly insuranceTenureHandler: InsuranceTenureHandler,
    private readonly loanInterestHandler: LoanInterestHandler,
    private readonly microloanHandler: MicroloanHandler,
    private readonly mortgageHandler: MortgageHandler,
    private readonly ndflHandler: NdflHandler,
    private readonly otpusknyeHandler: OtpusknyeHandler,
    private readonly penaltyContractHandler: PenaltyContractHandler,
    private readonly peniHandler: PeniHandler,
    private readonly propertyDeductionHandler: PropertyDeductionHandler,
    private readonly propertySaleTaxHandler: PropertySaleTaxHandler,
    private readonly refinancingHandler: RefinancingHandler,
    private readonly transportTaxHandler: TransportTaxHandler,
    private readonly unusedVacationHandler: UnusedVacationHandler,
    private readonly rastamozhkaHandler: RastamozhkaHandler,
  ) {}

  private async resolveApiKey(apiKey: string, endpoint: string, ip: string) {
    if (!apiKey) {
      throw new UnauthorizedException('x-api-key header is required');
    }
    const resolved = await this.apiKeysService.resolveByRawKey(apiKey);
    if (!resolved) {
      throw new UnauthorizedException('Invalid API key');
    }
    await this.calculatorsService.trackUsage(
      resolved.apiKeyId,
      resolved.userId,
      endpoint,
      ip,
    );
  }

  @Post('osago')
  @ApiOperation({
    summary: 'OSAGO calculator',
    description:
      'Built-in OSAGO premium calculation. Input: category, horsePower, regionCode, driverAge, driverExperience, kbmClass, usagePeriod, unlimitedDrivers, optional baseTariff.',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
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
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'OSAGO calculation result',
    schema: {
      example: {
        calculator: 'osago',
        region: '77',
        formulaVersion: 'osago',
        calculatedAt: '2026-02-27T10:00:00.000Z',
        input: { category: 'B', horsePower: 120, regionCode: '77' },
        result: {
          baseTariff: 4942,
          kt: 1.9,
          kvs: 1.01,
          kbm: 1,
          km: 1.2,
          ks: 1,
          ko: 1,
          total: 11234,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculateOsago(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(apiKey, '/api/v1/calculate/osago', ip);
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.osagoHandler.calculate(body.input, {
      calculatorSlug: 'osago',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'osago',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('auto-loan')
  @ApiOperation({
    summary: 'Auto loan calculator',
    description:
      'Built-in auto loan (annuity) calculation. Input: carPrice, downPayment, annualRate, termMonths.',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
          regionCode: 'GLB',
          input: {
            carPrice: 2_000_000,
            downPayment: 400_000,
            annualRate: 12,
            termMonths: 60,
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Auto loan calculation result',
    schema: {
      example: {
        calculator: 'auto-loan',
        region: 'GLB',
        formulaVersion: 'auto-loan',
        calculatedAt: '2026-02-27T10:00:00.000Z',
        input: {
          carPrice: 2000000,
          downPayment: 400000,
          annualRate: 12,
          termMonths: 60,
        },
        result: {
          loanAmount: 1600000,
          monthlyPayment: 35566.67,
          totalPayment: 2134000.2,
          totalInterest: 534000.2,
          schedule: [
            {
              month: 1,
              payment: 35566.67,
              principal: 29566.67,
              interest: 6000,
              balance: 1570433.33,
            },
          ],
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculateAutoLoan(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(apiKey, '/api/v1/calculate/auto-loan', ip);
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.autoLoanHandler.calculate(body.input, {
      calculatorSlug: 'auto-loan',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'auto-loan',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('credit-early-repayment')
  @ApiOperation({
    summary: 'Credit early repayment calculator',
    description:
      'Built-in credit calculator with early repayments, rate changes and credit holidays. Input: loanAmount, annualRatePercent, termMonths, issueDate, optional earlyPayments, rateChanges, creditHolidays, and options (firstPaymentInterestOnly, roundPayment, roundTo, transferWeekends, transferDirection).',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
          regionCode: 'GLB',
          input: {
            loanAmount: 5_000_000,
            annualRatePercent: 18,
            termMonths: 180,
            issueDate: '2026-02-22',
            earlyPayments: [],
            rateChanges: [],
            creditHolidays: [],
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Credit early repayment calculation result',
    schema: {
      example: {
        calculator: 'credit-early-repayment',
        region: 'GLB',
        formulaVersion: 'credit-early-repayment',
        calculatedAt: '2026-02-27T10:00:00.000Z',
        input: {
          loanAmount: 5000000,
          annualRatePercent: 18,
          termMonths: 180,
          issueDate: '2026-02-22',
        },
        result: {
          baseMonthlyPayment: 75926.42,
          totalInterest: 8667555.6,
          interestSaved: 0,
          termSavedMonths: 0,
          totalEarlyPaid: 0,
          schedule: [
            {
              n: 1,
              date: '22.03.2026',
              payment: 75926.42,
              principal: 926.42,
              interest: 75000,
              early: 0,
              balance: 4999073.58,
              ratePercent: 18,
            },
          ],
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculateCreditEarlyRepayment(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(
      apiKey,
      '/api/v1/calculate/credit-early-repayment',
      ip,
    );
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.creditEarlyRepaymentHandler.calculate(
      body.input,
      {
        calculatorSlug: 'credit-early-repayment',
        regionCode: body.regionCode,
        calculatedAt,
      },
    );
    return {
      calculator: 'credit-early-repayment',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('deposit')
  @ApiOperation({
    summary: 'Deposit (savings) calculator',
    description:
      'Built-in deposit calculator: compound interest, top-ups, withdrawals, capitalization, tax (259-FZ). Input: principal, startDate, term, termUnit, annualRatePercent, capitalization, compoundFrequency, payoutFrequency, optional oneTimeTopUps, regularTopUps, oneTimeWithdrawals, regularWithdrawals, minimumBalance, keyRatePercent, taxRatePercent.',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
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
            oneTimeTopUps: [],
            regularTopUps: [],
            oneTimeWithdrawals: [],
            regularWithdrawals: [],
            minimumBalance: 0,
            keyRatePercent: 16,
            taxRatePercent: 13,
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Deposit calculation result',
    schema: {
      example: {
        calculator: 'deposit',
        region: 'GLB',
        formulaVersion: 'deposit',
        calculatedAt: '2026-02-27T10:00:00.000Z',
        input: {
          principal: 1000000,
          startDate: '2026-02-27',
          term: 12,
          termUnit: 'months',
          annualRatePercent: 18,
          capitalization: true,
          compoundFrequency: '1M',
          payoutFrequency: 'end',
        },
        result: {
          totalInterest: 195618.2,
          finalBalance: 1195618.2,
          totalReturn: 1195618.2,
          totalTopUps: 1000000,
          totalWithdrawals: 0,
          netIncome: 195618.2,
          effectiveRatePercent: 18,
          totalTax: 2030.37,
          schedule: [],
          taxRows: [],
          blockedWithdrawals: [],
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculateDeposit(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(apiKey, '/api/v1/calculate/deposit', ip);
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.depositHandler.calculate(body.input, {
      calculatorSlug: 'deposit',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'deposit',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('fuel-consumption')
  @ApiOperation({
    summary: 'Fuel consumption calculator',
    description:
      'Built-in fuel calculator: mode "consumption" (average consumption from distance/fuel/price) or "trip" (liters and cost for a trip from distance, l/100km, price).',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      consumption: {
        summary: 'Average consumption',
        value: {
          regionCode: 'GLB',
          input: {
            mode: 'consumption',
            distance: 500,
            fuelUsed: 40,
            fuelPrice: 56,
          },
        },
      },
      trip: {
        summary: 'Trip planning',
        value: {
          regionCode: 'GLB',
          input: {
            mode: 'trip',
            distance: 300,
            consumptionPer100: 8,
            fuelPrice: 56,
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description:
      'Fuel consumption result (mode=consumption: per100km, tripCost, costPerKm; mode=trip: liters, cost)',
    schema: {
      example: {
        calculator: 'fuel-consumption',
        region: 'GLB',
        formulaVersion: 'fuel-consumption',
        calculatedAt: '2026-02-27T10:00:00.000Z',
        input: {
          mode: 'consumption',
          distance: 500,
          fuelUsed: 40,
          fuelPrice: 56,
        },
        result: {
          mode: 'consumption',
          per100km: 8,
          tripCost: 2240,
          costPerKm: 4.48,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculateFuelConsumption(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(apiKey, '/api/v1/calculate/fuel-consumption', ip);
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.fuelConsumptionHandler.calculate(body.input, {
      calculatorSlug: 'fuel-consumption',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'fuel-consumption',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('insurance-tenure')
  @ApiOperation({
    summary: 'Insurance tenure calculator',
    description:
      'Built-in insurance tenure (страховой стаж): sum of work periods, sick pay percentage 60/80/100% (art. 7 № 255-ФЗ). Input: periods[{ startDate, endDate }].',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
          regionCode: 'GLB',
          input: {
            periods: [
              { startDate: '2015-03-01', endDate: '2020-06-15' },
              { startDate: '2020-09-01', endDate: '2025-01-31' },
            ],
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Insurance tenure result',
    schema: {
      example: {
        calculator: 'insurance-tenure',
        region: 'GLB',
        formulaVersion: 'insurance-tenure',
        calculatedAt: '2026-02-27T10:00:00.000Z',
        input: {
          periods: [{ startDate: '2015-03-01', endDate: '2020-06-15' }],
        },
        result: {
          totalYears: 9,
          totalMonths: 9,
          totalDays: 15,
          rawDays: 3581,
          sickPayPercent: 100,
          sickPayDescription: 'Стаж 8+ лет — 100% среднего заработка',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculateInsuranceTenure(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(apiKey, '/api/v1/calculate/insurance-tenure', ip);
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.insuranceTenureHandler.calculate(body.input, {
      calculatorSlug: 'insurance-tenure',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'insurance-tenure',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('loan-interest')
  @ApiOperation({
    summary: 'Loan interest calculator (art. 809 Civil Code)',
    description:
      'Built-in loan interest: principal, start/end dates, rate changes, partial payouts, debt increases. Interest from day after issuance to return date inclusive.',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
          regionCode: 'GLB',
          input: {
            principal: 500_000,
            startDate: '2025-02-27',
            endDate: '2026-02-27',
            initialRatePercent: 10,
            rateChanges: [],
            payouts: [],
            debtIncreases: [],
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description:
      'Loan interest result: totalInterest, totalDebtAndInterest, totalDays, rows',
    schema: {
      example: {
        calculator: 'loan-interest',
        region: 'GLB',
        formulaVersion: 'loan-interest',
        calculatedAt: '2026-02-27T10:00:00.000Z',
        input: {
          principal: 500000,
          startDate: '2025-02-27',
          endDate: '2026-02-27',
          initialRatePercent: 10,
        },
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
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculateLoanInterest(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(apiKey, '/api/v1/calculate/loan-interest', ip);
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.loanInterestHandler.calculate(body.input, {
      calculatorSlug: 'loan-interest',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'loan-interest',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('microloan')
  @ApiOperation({
    summary: 'Microloan calculator',
    description:
      'Built-in microloan: interest accrual by day/month, overdue period and rate, penalty. Returns interestAccrued, totalToRepay, overdueInterest, grandTotal, dailyAccrual[].',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
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
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Microloan result',
    schema: {
      example: {
        calculator: 'microloan',
        region: 'GLB',
        formulaVersion: 'microloan',
        calculatedAt: '2026-02-27T10:00:00.000Z',
        input: { amount: 30000, termDays: 30, rate: 0.8, rateUnit: 'day' },
        result: {
          interestAccrued: 7200,
          totalToRepay: 37200,
          overdueInterest: 0,
          overdueTotal: 0,
          grandTotal: 37200,
          dailyAccrual: [{ day: 1, interest: 240, total: 30240 }],
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculateMicroloan(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(apiKey, '/api/v1/calculate/microloan', ip);
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.microloanHandler.calculate(body.input, {
      calculatorSlug: 'microloan',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'microloan',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('mortgage')
  @ApiOperation({
    summary: 'Mortgage calculator',
    description:
      'Built-in mortgage: annuity payment, principal, total payment and interest. Input: propertyPrice, downPayment, annualRate, termYears.',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
          regionCode: 'GLB',
          input: {
            propertyPrice: 10_000_000,
            downPayment: 2_000_000,
            annualRate: 18,
            termYears: 20,
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Mortgage calculation result (summary only)',
    schema: {
      example: {
        calculator: 'mortgage',
        region: 'GLB',
        formulaVersion: 'mortgage',
        calculatedAt: '2026-02-27T10:00:00.000Z',
        input: {
          propertyPrice: 10000000,
          downPayment: 2000000,
          annualRate: 18,
          termYears: 20,
        },
        result: {
          principal: 8000000,
          monthlyPayment: 115992.93,
          totalPayment: 27838303.2,
          totalInterest: 19838303.2,
          termMonths: 240,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculateMortgage(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(apiKey, '/api/v1/calculate/mortgage', ip);
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.mortgageHandler.calculate(body.input, {
      calculatorSlug: 'mortgage',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'mortgage',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('ndfl')
  @ApiOperation({
    summary: 'NDFL calculator',
    description:
      'Built-in NDFL: progressive/flat rate, fromGross/fromNet, income types, non-resident. Returns gross, tax, net, effectiveRate.',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
          regionCode: 'GLB',
          input: {
            income: 100_000,
            incomeType: 'salary',
            isNonResident: false,
            direction: 'fromGross',
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'NDFL result',
    schema: {
      example: {
        calculator: 'ndfl',
        region: 'GLB',
        formulaVersion: 'ndfl',
        calculatedAt: '2026-02-27T10:00:00.000Z',
        input: { income: 100000, incomeType: 'salary', direction: 'fromGross' },
        result: { gross: 100000, tax: 13000, net: 87000, effectiveRate: 13 },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculateNdfl(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(apiKey, '/api/v1/calculate/ndfl', ip);
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.ndflHandler.calculate(body.input, {
      calculatorSlug: 'ndfl',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'ndfl',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('otpusknye')
  @ApiOperation({
    summary: 'Otpusknye (vacation pay) calculator',
    description:
      'Built-in vacation pay by ТК РФ (ПП 922): average daily earnings, NDFL 13%. Input: totalEarnings, fullMonths, partialMonths[], vacationDays.',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
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
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Otpusknye result',
    schema: {
      example: {
        calculator: 'otpusknye',
        region: 'GLB',
        formulaVersion: 'otpusknye',
        calculatedAt: '2026-02-27T10:00:00.000Z',
        input: { totalEarnings: 720000, fullMonths: 10, vacationDays: 28 },
        result: {
          avgDailyPay: 2452.05,
          calcDays: 293.7,
          vacationPay: 68657.4,
          ndfl: 8925.46,
          netPay: 59731.94,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculateOtpusknye(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(apiKey, '/api/v1/calculate/otpusknye', ip);
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.otpusknyeHandler.calculate(body.input, {
      calculatorSlug: 'otpusknye',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'otpusknye',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('penalty-contract')
  @ApiOperation({
    summary: 'Penalty (contract) calculator',
    description:
      'Built-in contract penalty: calendar/workdays, rate types, excluded periods, partial payments, additional debts. Returns totalPenalty, totalPenaltyCapped, totalDebtAndPenalty, breakdown[].',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
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
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Penalty contract result',
    schema: {
      example: {
        calculator: 'penalty-contract',
        region: 'GLB',
        formulaVersion: 'penalty-contract',
        calculatedAt: '2026-02-27T10:00:00.000Z',
        result: {
          totalPenalty: 13500,
          totalPenaltyCapped: 13500,
          limitApplied: null,
          totalDebtAndPenalty: 513500,
          breakdown: [],
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculatePenaltyContract(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(apiKey, '/api/v1/calculate/penalty-contract', ip);
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.penaltyContractHandler.calculate(body.input, {
      calculatorSlug: 'penalty-contract',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'penalty-contract',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('peni')
  @ApiOperation({
    summary: 'Peni (tax/utilities/salary) calculator',
    description:
      'Built-in peni by key rate: tax (1/300 or 1/150), utilities (0 then 1/300, 1/130), salary (1/150). Input: debt, calcType, payerType, dateFrom, dateTo. Returns totalDays, totalPeni, breakdown[].',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
          regionCode: 'GLB',
          input: {
            debt: 100_000,
            calcType: 'tax',
            payerType: 'individual',
            dateFrom: '2025-01-27',
            dateTo: '2025-02-27',
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Peni result',
    schema: {
      example: {
        calculator: 'peni',
        region: 'GLB',
        formulaVersion: 'peni',
        calculatedAt: '2026-02-27T10:00:00.000Z',
        result: {
          totalDays: 31,
          totalPeni: 1341.67,
          breakdown: [
            {
              dateFrom: '2025-01-28',
              dateTo: '2025-01-28',
              keyRate: 21,
              fraction: 0.00333,
              dailyPeni: 43.33,
              days: 1,
            },
          ],
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculatePeni(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(apiKey, '/api/v1/calculate/peni', ip);
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.peniHandler.calculate(body.input, {
      calculatorSlug: 'peni',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'peni',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('property-deduction')
  @ApiOperation({
    summary: 'Property deduction calculator',
    description:
      'Built-in property tax deduction: max 2M RUB deduction, max 260K RUB NDFL return. Input: propertyPrice, purchaseYear, incomeByYear, usedPreviously, previousUsePeriod, returnedAmount.',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
          regionCode: 'GLB',
          input: {
            propertyPrice: 10_000_000,
            purchaseYear: 2024,
            incomeByYear: { 2022: 1_200_000, 2023: 1_200_000, 2024: 1_200_000 },
            usedPreviously: false,
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Property deduction result',
    schema: {
      example: {
        calculator: 'property-deduction',
        region: 'GLB',
        formulaVersion: 'property-deduction',
        calculatedAt: '2026-02-27T10:00:00.000Z',
        result: {
          unusedDeduction: 2000000,
          taxToReturn: 260000,
          totalNdflEntered: 468000,
          availableFromEnteredYears: 260000,
          remainingForFutureYears: 0,
          yearsWithIncome: [2022, 2023, 2024],
          isFullyBlocked: false,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculatePropertyDeduction(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(
      apiKey,
      '/api/v1/calculate/property-deduction',
      ip,
    );
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.propertyDeductionHandler.calculate(body.input, {
      calculatorSlug: 'property-deduction',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'property-deduction',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('property-sale-tax')
  @ApiOperation({
    summary: 'Property sale tax calculator',
    description:
      'Built-in NDFL on property sale: min holding period, cadastral value, fixed deduction 1M or purchase expenses. Input: ownershipBefore2016, acquisitionType, isSoleHousing, yearsHeld, salePrice, cadastralValue, coefficient, useFixedDeduction, purchaseExpenses, saleAfter2025.',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
          regionCode: 'GLB',
          input: {
            ownershipBefore2016: false,
            acquisitionType: 'purchase',
            isSoleHousing: false,
            yearsHeld: 2,
            salePrice: 8_000_000,
            cadastralValue: 7_000_000,
            coefficient: 0.7,
            useFixedDeduction: true,
            purchaseExpenses: 0,
            saleAfter2025: true,
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Property sale tax result',
    schema: {
      example: {
        calculator: 'property-sale-tax',
        region: 'GLB',
        formulaVersion: 'property-sale-tax',
        calculatedAt: '2026-02-27T10:00:00.000Z',
        result: {
          taxableIncome: 8000000,
          taxableBase: 7000000,
          tax: 910000,
          minPeriodYears: 5,
          noTax: false,
          explanation:
            'Фактический срок владения квартирой (2 года) меньше минимального (5 лет). Налог считается по прогрессивной шкале…',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculatePropertySaleTax(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(apiKey, '/api/v1/calculate/property-sale-tax', ip);
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.propertySaleTaxHandler.calculate(body.input, {
      calculatorSlug: 'property-sale-tax',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'property-sale-tax',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('refinancing')
  @ApiOperation({
    summary: 'Refinancing calculator',
    description:
      'Built-in mortgage refinancing: current vs new terms, annuity payments, total interest, schedule. Input: remainingDebt, remainingTerm, remainingTermUnit, currentRate, optional newRate, newTerm, newTermUnit, newAmount.',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
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
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Refinancing result with scheduleData',
    schema: {
      example: {
        calculator: 'refinancing',
        region: 'GLB',
        formulaVersion: 'refinancing',
        result: {
          currentMonthlyPayment: 75028.52,
          refinancedMonthlyPayment: 59726.42,
          currentTotalInterest: 8505134,
          refinancedTotalInterest: 5750756,
          totalInterestDelta: -2754378,
          monthlyPaymentDelta: -15302.1,
          scheduleData: [{ year: 1, paid: 0, interest: 0, balance: 0 }],
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculateRefinancing(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(apiKey, '/api/v1/calculate/refinancing', ip);
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.refinancingHandler.calculate(body.input, {
      calculatorSlug: 'refinancing',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'refinancing',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('transport-tax')
  @ApiOperation({
    summary: 'Transport tax calculator',
    description:
      'Built-in transport tax (vehicle tax): base rate by category, regional multiplier, luxury coefficient. Input: horsePower, vehicleCategory, regionCode, ownershipMonths, optional carPrice, carYear, taxYear.',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
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
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Transport tax result',
    schema: {
      example: {
        calculator: 'transport-tax',
        region: '77',
        formulaVersion: 'transport-tax',
        result: {
          baseRate: 5,
          regionalRate: 25,
          luxuryMultiplier: 1,
          ownershipCoeff: 1,
          taxAmount: 18750,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculateTransportTax(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(apiKey, '/api/v1/calculate/transport-tax', ip);
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.transportTaxHandler.calculate(body.input, {
      calculatorSlug: 'transport-tax',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'transport-tax',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('unused-vacation')
  @ApiOperation({
    summary: 'Unused vacation compensation calculator',
    description:
      'Built-in compensation for unused vacation on dismissal (Labour Code). Input: avgDailyPay, startDate, endDate, annualVacationDays, usedVacationDays, optional excludedPeriods[].',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
          regionCode: 'GLB',
          input: {
            avgDailyPay: 2048,
            startDate: '2024-01-01',
            endDate: '2025-02-27',
            annualVacationDays: 28,
            usedVacationDays: 0,
            excludedPeriods: [],
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Unused vacation compensation result',
    schema: {
      example: {
        calculator: 'unused-vacation',
        region: 'GLB',
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
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculateUnusedVacation(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(apiKey, '/api/v1/calculate/unused-vacation', ip);
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.unusedVacationHandler.calculate(body.input, {
      calculatorSlug: 'unused-vacation',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'unused-vacation',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }

  @Post('rastamozhka-auto')
  @ApiOperation({
    summary: 'Rastamozhka (customs) calculator',
    description:
      'Built-in customs clearance for auto import: customs fee, duty, recycling fee, excise, VAT. Input: priceEur, engineVolume, horsePower, engineType, ageGroup, importerType, eurRate.',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'API key for B2B/B2B2C access',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      default: {
        value: {
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
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Rastamozhka result',
    schema: {
      example: {
        calculator: 'rastamozhka-auto',
        region: 'GLB',
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
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'x-api-key is missing or invalid' })
  async calculateRastamozhka(
    @Body() body: CalculateRequestDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ): Promise<CalculationResponse> {
    await this.resolveApiKey(apiKey, '/api/v1/calculate/rastamozhka-auto', ip);
    const calculatedAt = body.calculationDate
      ? new Date(body.calculationDate).toISOString()
      : new Date().toISOString();
    const result = await this.rastamozhkaHandler.calculate(body.input, {
      calculatorSlug: 'rastamozhka-auto',
      regionCode: body.regionCode,
      calculatedAt,
    });
    return {
      calculator: 'rastamozhka-auto',
      region: body.regionCode,
      formulaVersion: result.formulaVersion,
      calculatedAt,
      input: body.input,
      result: result.result,
    };
  }
}
