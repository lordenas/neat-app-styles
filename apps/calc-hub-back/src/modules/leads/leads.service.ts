import { Injectable, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq, ilike, or } from 'drizzle-orm';
import { DatabaseService } from '../../db/database.service';
import { builderCalculators, calcLeads } from '../../db/schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ListLeadsQueryDto } from './dto/list-leads-query.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly dbService: DatabaseService) {}

  async list(userId: string, query: ListLeadsQueryDto) {
    const clauses = [eq(calcLeads.ownerUserId, userId)];
    if (query.calculator_id) {
      clauses.push(eq(calcLeads.calculatorId, query.calculator_id));
    }
    if (query.search) {
      clauses.push(
        or(
          ilike(calcLeads.email, `%${query.search}%`),
          ilike(calcLeads.name, `%${query.search}%`),
          ilike(calcLeads.phone, `%${query.search}%`),
        )!,
      );
    }
    const whereClause = clauses.length > 1 ? and(...clauses) : clauses[0];
    const [totalRows, rows] = await Promise.all([
      this.dbService.db
        .select({ total: count() })
        .from(calcLeads)
        .where(whereClause),
      this.dbService.db.query.calcLeads.findMany({
        where: whereClause,
        orderBy: [desc(calcLeads.createdAt)],
        limit: query.limit ?? 50,
        offset: query.offset ?? 0,
      }),
    ]);
    return { data: rows, total: totalRows[0]?.total ?? 0 };
  }

  async create(dto: CreateLeadDto) {
    const calculator =
      await this.dbService.db.query.builderCalculators.findFirst({
        where: eq(builderCalculators.id, dto.calculatorId),
        columns: { id: true, userId: true, title: true, isPublic: true },
      });
    if (!calculator || !calculator.isPublic) {
      throw new NotFoundException('Public calculator not found');
    }

    const [lead] = await this.dbService.db
      .insert(calcLeads)
      .values({
        calculatorId: dto.calculatorId,
        calculatorTitle: dto.calculatorTitle ?? calculator.title,
        ownerUserId: calculator.userId,
        email: dto.email,
        name: dto.name ?? null,
        phone: dto.phone ?? null,
        formValues: dto.formValues,
        resultValues: dto.resultValues,
      })
      .returning({ id: calcLeads.id });

    return { id: lead.id };
  }

  async remove(userId: string, id: string) {
    await this.dbService.db
      .delete(calcLeads)
      .where(and(eq(calcLeads.id, id), eq(calcLeads.ownerUserId, userId)));
  }

  async exportCsv(userId: string, calculatorId?: string) {
    const clauses = [eq(calcLeads.ownerUserId, userId)];
    if (calculatorId) clauses.push(eq(calcLeads.calculatorId, calculatorId));
    const whereClause = clauses.length > 1 ? and(...clauses) : clauses[0];
    const rows = await this.dbService.db.query.calcLeads.findMany({
      where: whereClause,
      orderBy: [desc(calcLeads.createdAt)],
    });

    const headers = ['Email', 'Name', 'Phone', 'Calculator', 'Date', 'Result'];
    const lines = rows.map((row) => {
      const values = [
        row.email,
        row.name ?? '',
        row.phone ?? '',
        row.calculatorTitle ?? '',
        row.createdAt.toISOString(),
        JSON.stringify(row.resultValues ?? {}),
      ];
      return values
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(',');
    });
    return [headers.join(','), ...lines].join('\n');
  }
}
