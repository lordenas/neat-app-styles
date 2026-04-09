import { Injectable } from '@nestjs/common';
import { calcPropertySaleTax } from '../../property-sale-tax/property-sale-tax.engine';
import { PropertySaleTaxCalculateInputDto } from '../../dto/property-sale-tax-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

const DEFAULT_COEFFICIENT = 0.7;

@Injectable()
export class PropertySaleTaxHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return (
      calculatorType === 'property_sale_tax' || slug === 'property-sale-tax'
    );
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      PropertySaleTaxCalculateInputDto,
      input,
    );
    const engineInput = {
      ownershipBefore2016: dto.ownershipBefore2016 ?? false,
      acquisitionType: dto.acquisitionType,
      isSoleHousing: dto.isSoleHousing ?? false,
      yearsHeld: Number(dto.yearsHeld),
      salePrice: dto.salePrice,
      cadastralValue: dto.cadastralValue,
      coefficient: dto.coefficient ?? DEFAULT_COEFFICIENT,
      useFixedDeduction: dto.useFixedDeduction ?? true,
      purchaseExpenses: dto.purchaseExpenses ?? 0,
      saleAfter2025: dto.saleAfter2025 ?? true,
    };
    const result = calcPropertySaleTax(engineInput);
    return {
      formulaVersion: 'property-sale-tax',
      result: result as unknown as Record<string, unknown>,
    };
  }
}
