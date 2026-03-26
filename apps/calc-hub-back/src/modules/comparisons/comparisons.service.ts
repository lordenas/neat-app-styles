import { Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DatabaseService } from '../../db/database.service';
import { savedCalculations } from '../../db/schema';
import { CreateComparisonDto } from './dto/create-comparison.dto';

@Injectable()
export class ComparisonsService {
  constructor(private readonly dbService: DatabaseService) {}

  async compare(userId: string, dto: CreateComparisonDto) {
    const rows = await this.dbService.db.query.savedCalculations.findMany({
      where: and(
        eq(savedCalculations.userId, userId),
        inArray(savedCalculations.id, dto.calculationIds),
      ),
      columns: {
        id: true,
        inputPayload: true,
        resultPayload: true,
        createdAt: true,
      },
    });
    return {
      comparedCount: rows.length,
      items: rows,
    };
  }
}
