import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../../db/database.service';
import { apiUsage, calculators } from '../../db/schema';

export interface CalculationResponse {
  calculator: string;
  region: string;
  formulaVersion: string;
  calculatedAt: string;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
}

@Injectable()
export class CalculatorsService {
  constructor(private readonly dbService: DatabaseService) {}

  async getAvailableTypes(): Promise<string[]> {
    const rows = await this.dbService.db
      .select({ calculatorType: calculators.calculatorType })
      .from(calculators)
      .where(eq(calculators.isActive, true));
    const types = [...new Set(rows.map((r) => r.calculatorType))];
    return types.sort();
  }

  async trackUsage(
    apiKeyId: string,
    userId: string,
    endpoint: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.dbService.db.insert(apiUsage).values({
      apiKeyId,
      userId,
      endpoint,
      period: this.dbService.periodKey,
      ipAddress: ipAddress ?? null,
    });
  }
}
