import { Injectable } from '@nestjs/common';
import { calcRastamozhka } from '../../rastamozhka/rastamozhka.engine';
import { RastamozhkaCalculateInputDto } from '../../dto/rastamozhka-calculate-input.dto';
import { InputValidationService } from '../input-validation.service';
import type {
  BuiltinCalcContext,
  BuiltinCalcResult,
  IBuiltinCalculatorHandler,
} from '../builtin-calculator.handler';

@Injectable()
export class RastamozhkaHandler implements IBuiltinCalculatorHandler {
  constructor(private readonly inputValidation: InputValidationService) {}

  supports(calculatorType: string, slug: string): boolean {
    return calculatorType === 'rastamozhka_auto' || slug === 'rastamozhka-auto';
  }

  async calculate(
    input: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by IBuiltinCalculatorHandler
    _context: BuiltinCalcContext,
  ): Promise<BuiltinCalcResult> {
    const dto = await this.inputValidation.validateAndTransform(
      RastamozhkaCalculateInputDto,
      input,
    );
    const engineInput = {
      priceEur: dto.priceEur,
      engineVolume: dto.engineVolume,
      horsePower: dto.horsePower,
      engineType: dto.engineType,
      ageGroup: dto.ageGroup,
      importerType: dto.importerType,
      eurRate: dto.eurRate,
    };
    const result = calcRastamozhka(engineInput);
    return {
      formulaVersion: 'rastamozhka-auto',
      result: result as unknown as Record<string, unknown>,
    };
  }
}
