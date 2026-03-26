import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DatabaseService } from '../../../db/database.service';
import { regions } from '../../../db/schema';
import { FormulaDslEngineService } from '../../formulas/formula-dsl-engine.service';
import { FormulaDslValidatorService } from '../../formulas/formula-dsl-validator.service';
import { FormulaSelectorService } from '../../formulas/formula-selector.service';

export interface DslExecutionResult {
  regionCode: string;
  formulaVersion: string;
  result: Record<string, unknown>;
}

export interface DslExecutionParams {
  calculatorId: string;
  calculatorSlug: string;
  regionCode: string;
  input: Record<string, unknown>;
  calculationDate: Date;
}

@Injectable()
export class DslCalculationExecutor {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly formulaSelectorService: FormulaSelectorService,
    private readonly formulaDslValidatorService: FormulaDslValidatorService,
    private readonly formulaDslEngineService: FormulaDslEngineService,
  ) {}

  async execute(params: DslExecutionParams): Promise<DslExecutionResult> {
    const { calculatorId, regionCode, input, calculationDate } = params;
    const region = await this.dbService.db.query.regions.findFirst({
      where: and(eq(regions.code, regionCode), eq(regions.isActive, true)),
    });
    if (!region) {
      throw new NotFoundException('Region not found');
    }

    const formula = await this.formulaSelectorService.getActiveFormula({
      calculatorId,
      regionId: region.id,
      calculationDate,
    });

    const validatedFormula = this.formulaDslValidatorService.validate(
      formula.jsonDefinition,
    );
    const executionResult = this.formulaDslEngineService.execute(
      validatedFormula,
      input,
    );
    const result = {
      ...executionResult.outputs,
      outputs: executionResult.outputs,
      variablesSnapshot: executionResult.variablesSnapshot,
      engineMeta: executionResult.engineMeta,
    };

    return {
      regionCode: region.code,
      formulaVersion: formula.version,
      result,
    };
  }
}
