import { Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, gte, isNull, lte, or } from 'drizzle-orm';
import { DatabaseService } from '../../db/database.service';
import { formulas } from '../../db/schema';

@Injectable()
export class FormulaSelectorService {
  constructor(private readonly dbService: DatabaseService) {}

  async getActiveFormula(params: {
    calculatorId: string;
    regionId: string;
    calculationDate: Date;
  }) {
    const row = await this.dbService.db.query.formulas.findFirst({
      where: and(
        eq(formulas.calculatorId, params.calculatorId),
        eq(formulas.regionId, params.regionId),
        lte(formulas.effectiveFrom, params.calculationDate),
        or(
          gte(formulas.effectiveTo, params.calculationDate),
          isNull(formulas.effectiveTo),
        ),
        eq(formulas.isActive, true),
      ),
      orderBy: [desc(formulas.effectiveFrom)],
    });

    if (!row) {
      throw new NotFoundException(
        'No active formula for calculator/region/date',
      );
    }
    return row;
  }
}
