import { Module } from '@nestjs/common';
import { ApiKeysModule } from '../api-keys/api-keys.module';
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
import { InputValidationService } from './builtin/input-validation.service';
import { CalculateController } from './calculate.controller';
import { CalculatorTypesController } from './calculator-types.controller';
import { CalculatorsService } from './calculators.service';

@Module({
  imports: [ApiKeysModule],
  controllers: [CalculateController, CalculatorTypesController],
  providers: [
    InputValidationService,
    OsagoHandler,
    AutoLoanHandler,
    CreditEarlyRepaymentHandler,
    DepositHandler,
    FuelConsumptionHandler,
    InsuranceTenureHandler,
    LoanInterestHandler,
    MicroloanHandler,
    MortgageHandler,
    NdflHandler,
    OtpusknyeHandler,
    PenaltyContractHandler,
    PeniHandler,
    PropertyDeductionHandler,
    PropertySaleTaxHandler,
    RefinancingHandler,
    TransportTaxHandler,
    UnusedVacationHandler,
    RastamozhkaHandler,
    CalculatorsService,
  ],
  exports: [CalculatorsService],
})
export class CalculatorsModule {}
