import { Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../db/database.service';
import {
  calculators,
  formulas,
  regions,
  savedCalculations,
  sharedLinks,
} from '../../db/schema';
import { SaveCalculationDto } from './dto/save-calculation.dto';

type SavedCalculationRow = typeof savedCalculations.$inferSelect;

@Injectable()
export class CalculationsService {
  constructor(private readonly dbService: DatabaseService) {}

  async save(userId: string, dto: SaveCalculationDto): Promise<{ id: string }> {
    const calculator = await this.dbService.db.query.calculators.findFirst({
      where: eq(calculators.slug, dto.calculatorSlug),
    });
    const region = await this.dbService.db.query.regions.findFirst({
      where: eq(regions.code, dto.regionCode),
    });

    if (!calculator || !region) {
      throw new NotFoundException('Calculator or region not found');
    }

    const formula = await this.dbService.db.query.formulas.findFirst({
      where: and(
        eq(formulas.calculatorId, calculator.id),
        eq(formulas.regionId, region.id),
      ),
      orderBy: [desc(formulas.effectiveFrom)],
    });
    if (!formula) {
      throw new NotFoundException(
        'Formula not found for calculator and region',
      );
    }

    const [saved] = await this.dbService.db
      .insert(savedCalculations)
      .values({
        userId,
        calculatorId: calculator.id,
        regionId: region.id,
        formulaId: formula.id,
        calculationDate: new Date(dto.calculationDate),
        inputPayload: dto.input,
        resultPayload: dto.result,
      })
      .returning({ id: savedCalculations.id });

    return saved;
  }

  list(userId: string): Promise<SavedCalculationRow[]> {
    return this.dbService.db.query.savedCalculations.findMany({
      where: eq(savedCalculations.userId, userId),
      orderBy: [desc(savedCalculations.createdAt)],
    });
  }

  async getOne(userId: string, id: string): Promise<SavedCalculationRow> {
    const row = await this.dbService.db.query.savedCalculations.findFirst({
      where: and(
        eq(savedCalculations.userId, userId),
        eq(savedCalculations.id, id),
      ),
    });
    if (!row) {
      throw new NotFoundException('Calculation not found');
    }
    return row;
  }

  async delete(userId: string, id: string): Promise<{ success: boolean }> {
    const [deleted] = await this.dbService.db
      .delete(savedCalculations)
      .where(
        and(eq(savedCalculations.userId, userId), eq(savedCalculations.id, id)),
      )
      .returning({ id: savedCalculations.id });
    if (!deleted) {
      throw new NotFoundException('Calculation not found');
    }
    return { success: true };
  }

  async share(
    userId: string,
    calculationId: string,
  ): Promise<{ token: string; url: string }> {
    await this.getOne(userId, calculationId);
    const token = randomUUID().replace(/-/g, '');
    await this.dbService.db.insert(sharedLinks).values({
      calculationId,
      token,
      expiresAt: null,
    });
    return { token, url: `/api/public/${token}` };
  }

  async publicByToken(token: string): Promise<SavedCalculationRow> {
    const link = await this.dbService.db.query.sharedLinks.findFirst({
      where: eq(sharedLinks.token, token),
    });
    if (!link) {
      throw new NotFoundException('Shared link not found');
    }
    const row = await this.dbService.db.query.savedCalculations.findFirst({
      where: eq(savedCalculations.id, link.calculationId),
    });
    if (!row) {
      throw new NotFoundException('Calculation not found');
    }
    return row;
  }
}
