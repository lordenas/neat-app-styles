import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { create, all } from 'mathjs';
import { DatabaseService } from '../../db/database.service';
import {
  builderCalculators,
  calcFields,
  calcPages,
  subscriptions,
} from '../../db/schema';
import { CreateCalculatorDto } from './dto/create-calculator.dto';
import { EvaluateFormulaDto } from './dto/evaluate-formula.dto';
import { UpdateCalculatorDto } from './dto/update-calculator.dto';
import { PlanLimitsService } from './plan-limits.service';
import { UpsertFieldDto } from './dto/upsert-field.dto';
import { UpsertPageDto } from './dto/upsert-page.dto';

const math = create(all, {});

@Injectable()
export class CalcBuilderService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly planLimitsService: PlanLimitsService,
  ) {}

  async list(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [totalRow, rows] = await Promise.all([
      this.dbService.db
        .select({ total: count() })
        .from(builderCalculators)
        .where(eq(builderCalculators.userId, userId)),
      this.dbService.db.query.builderCalculators.findMany({
        where: eq(builderCalculators.userId, userId),
        orderBy: [desc(builderCalculators.updatedAt)],
        offset,
        limit,
      }),
    ]);
    return {
      data: rows,
      total: totalRow[0]?.total ?? 0,
      page,
      limit,
    };
  }

  async getOne(userId: string, id: string) {
    const calc = await this.dbService.db.query.builderCalculators.findFirst({
      where: and(
        eq(builderCalculators.id, id),
        eq(builderCalculators.userId, userId),
      ),
    });
    if (!calc) throw new NotFoundException('Calculator not found');
    const [pages, fields] = await Promise.all([
      this.dbService.db.query.calcPages.findMany({
        where: eq(calcPages.calculatorId, calc.id),
        orderBy: [calcPages.orderIndex],
      }),
      this.dbService.db.query.calcFields.findMany({
        where: eq(calcFields.calculatorId, calc.id),
        orderBy: [calcFields.orderIndex],
      }),
    ]);
    return { data: { ...calc, pages, fields } };
  }

  async getPublicBySlug(slug: string) {
    const calcBySlug =
      await this.dbService.db.query.builderCalculators.findFirst({
        where: eq(builderCalculators.slug, slug),
      });
    if (!calcBySlug) throw new NotFoundException('Public calculator not found');
    if (!calcBySlug.isPublic)
      throw new ForbiddenException(
        'Calculator is not public. Set isPublic to true to make it available at this URL.',
      );
    const calc = calcBySlug;
    const [pages, fields] = await Promise.all([
      this.dbService.db.query.calcPages.findMany({
        where: eq(calcPages.calculatorId, calc.id),
        orderBy: [calcPages.orderIndex],
      }),
      this.dbService.db.query.calcFields.findMany({
        where: eq(calcFields.calculatorId, calc.id),
        orderBy: [calcFields.orderIndex],
      }),
    ]);
    return { data: { ...calc, pages, fields } };
  }

  async create(userId: string, dto: CreateCalculatorDto) {
    await this.assertPlanLimits(userId, dto.pages?.length ?? 0);
    const slug = this.makeSlug(dto.title);
    const [created] = await this.dbService.db
      .insert(builderCalculators)
      .values({
        userId,
        slug: `${slug}-${randomUUID().slice(0, 8)}`,
        title: dto.title,
        description: dto.description ?? null,
        isPublic: dto.isPublic ?? false,
        theme: dto.theme ?? {},
      })
      .returning();
    await this.replacePagesAndFields(created.id, dto.pages ?? [], dto.fields);
    return { data: { id: created.id, slug: created.slug } };
  }

  async update(userId: string, id: string, dto: UpdateCalculatorDto) {
    const existing = await this.dbService.db.query.builderCalculators.findFirst(
      {
        where: and(
          eq(builderCalculators.id, id),
          eq(builderCalculators.userId, userId),
        ),
      },
    );
    if (!existing) throw new NotFoundException('Calculator not found');

    const patch: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (dto.title) patch.title = dto.title;
    if (typeof dto.description !== 'undefined')
      patch.description = dto.description;
    if (typeof dto.isPublic !== 'undefined') patch.isPublic = dto.isPublic;
    if (dto.theme) patch.theme = dto.theme;

    await this.dbService.db
      .update(builderCalculators)
      .set(patch)
      .where(eq(builderCalculators.id, id));

    if (dto.pages || dto.fields) {
      await this.assertPlanLimits(userId, dto.pages?.length ?? 0);
      await this.replacePagesAndFields(id, dto.pages ?? [], dto.fields ?? []);
    }

    return { data: { id, updatedAt: new Date().toISOString() } };
  }

  async remove(userId: string, id: string) {
    const [deleted] = await this.dbService.db
      .delete(builderCalculators)
      .where(
        and(
          eq(builderCalculators.id, id),
          eq(builderCalculators.userId, userId),
        ),
      )
      .returning({ id: builderCalculators.id });
    if (!deleted) throw new NotFoundException('Calculator not found');
    return;
  }

  async createPage(userId: string, calcId: string, payload: UpsertPageDto) {
    await this.ensureOwner(userId, calcId);
    const [created] = await this.dbService.db
      .insert(calcPages)
      .values({
        calculatorId: calcId,
        title: typeof payload.title === 'string' ? payload.title : null,
        orderIndex: Number(payload.orderIndex ?? 0),
        autoAdvance: (payload.autoAdvance as Record<string, unknown>) ?? null,
        routes: (payload.routes as Record<string, unknown>[]) ?? null,
      })
      .returning({ id: calcPages.id });
    return { data: { id: created.id } };
  }

  async patchPage(
    userId: string,
    calcId: string,
    pageId: string,
    payload: UpsertPageDto,
  ) {
    await this.ensureOwner(userId, calcId);
    const [updated] = await this.dbService.db
      .update(calcPages)
      .set({
        title: typeof payload.title === 'string' ? payload.title : undefined,
        orderIndex:
          typeof payload.orderIndex === 'number'
            ? payload.orderIndex
            : undefined,
        autoAdvance: payload.autoAdvance as Record<string, unknown> | undefined,
        routes: payload.routes as Record<string, unknown>[] | undefined,
      })
      .where(and(eq(calcPages.id, pageId), eq(calcPages.calculatorId, calcId)))
      .returning({ id: calcPages.id });
    if (!updated) throw new NotFoundException('Page not found');
    return { data: { id: updated.id, updatedAt: new Date().toISOString() } };
  }

  async deletePage(userId: string, calcId: string, pageId: string) {
    await this.ensureOwner(userId, calcId);
    await this.dbService.db
      .delete(calcPages)
      .where(and(eq(calcPages.id, pageId), eq(calcPages.calculatorId, calcId)));
  }

  async createField(userId: string, calcId: string, payload: UpsertFieldDto) {
    await this.ensureOwner(userId, calcId);
    const [created] = await this.dbService.db
      .insert(calcFields)
      .values({
        calculatorId: calcId,
        pageId: (payload.pageId as string) ?? null,
        type: String(payload.type ?? ''),
        label: String(payload.label ?? ''),
        key: String(payload.key ?? ''),
        orderIndex: Number(payload.orderIndex ?? 0),
        rowId: String(payload.rowId ?? 'row-0'),
        config: payload.config ?? {},
        formula: (payload.formula as string) ?? null,
        visibility: (payload.visibility as Record<string, unknown>) ?? null,
      })
      .returning({ id: calcFields.id });
    return { data: { id: created.id } };
  }

  async patchField(
    userId: string,
    calcId: string,
    fieldId: string,
    payload: UpsertFieldDto,
  ) {
    await this.ensureOwner(userId, calcId);
    const [updated] = await this.dbService.db
      .update(calcFields)
      .set({
        pageId: payload.pageId ?? undefined,
        type: typeof payload.type === 'string' ? payload.type : undefined,
        label: typeof payload.label === 'string' ? payload.label : undefined,
        key: typeof payload.key === 'string' ? payload.key : undefined,
        orderIndex:
          typeof payload.orderIndex === 'number'
            ? payload.orderIndex
            : undefined,
        rowId: typeof payload.rowId === 'string' ? payload.rowId : undefined,
        config: payload.config as Record<string, unknown> | undefined,
        formula:
          typeof payload.formula === 'string' ? payload.formula : undefined,
        visibility: payload.visibility as Record<string, unknown> | undefined,
      })
      .where(
        and(eq(calcFields.id, fieldId), eq(calcFields.calculatorId, calcId)),
      )
      .returning({ id: calcFields.id });
    if (!updated) throw new NotFoundException('Field not found');
    return { data: { id: updated.id } };
  }

  async deleteField(userId: string, calcId: string, fieldId: string) {
    await this.ensureOwner(userId, calcId);
    await this.dbService.db
      .delete(calcFields)
      .where(
        and(eq(calcFields.id, fieldId), eq(calcFields.calculatorId, calcId)),
      );
  }

  evaluateFormula(dto: EvaluateFormulaDto) {
    try {
      const scope: Record<string, number> = {};
      for (const [key, value] of Object.entries(dto.values)) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          throw new UnprocessableEntityException(
            `Invalid numeric value for ${key}`,
          );
        }
        scope[key] = value;
      }
      const sanitized = dto.formula.replace(/\{([a-zA-Z0-9_]+)\}/g, '$1');
      const result: unknown = math.evaluate(sanitized, scope);
      if (typeof result !== 'number' || !Number.isFinite(result)) {
        return { error: 'Formula result is not a finite number' };
      }
      return { result };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Formula evaluation failed',
      };
    }
  }

  private async assertPlanLimits(userId: string, pagesCount: number) {
    const [planRow, countRow] = await Promise.all([
      this.dbService.db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, userId),
      }),
      this.dbService.db
        .select({ total: count() })
        .from(builderCalculators)
        .where(eq(builderCalculators.userId, userId)),
    ]);
    const limits = this.planLimitsService.getLimits(planRow?.plan);
    if ((countRow[0]?.total ?? 0) >= limits.maxCalcs) {
      throw new ForbiddenException(
        'PLAN_LIMIT_EXCEEDED: max calculators reached',
      );
    }
    if (pagesCount > limits.maxPages) {
      throw new ForbiddenException('PLAN_LIMIT_EXCEEDED: max pages exceeded');
    }
  }

  private async ensureOwner(userId: string, calcId: string) {
    const calc = await this.dbService.db.query.builderCalculators.findFirst({
      where: and(
        eq(builderCalculators.id, calcId),
        eq(builderCalculators.userId, userId),
      ),
      columns: { id: true },
    });
    if (!calc) throw new NotFoundException('Calculator not found');
  }

  private async replacePagesAndFields(
    calcId: string,
    pages: UpsertPageDto[],
    fields: UpsertFieldDto[],
  ) {
    await this.dbService.db.transaction(async (tx) => {
      await tx.delete(calcFields).where(eq(calcFields.calculatorId, calcId));
      await tx.delete(calcPages).where(eq(calcPages.calculatorId, calcId));

      const pageIdMap = new Map<string, string>();
      for (let index = 0; index < pages.length; index += 1) {
        const page = pages[index];
        const [savedPage] = await tx
          .insert(calcPages)
          .values({
            calculatorId: calcId,
            title: page.title ?? null,
            orderIndex: page.orderIndex ?? index,
            autoAdvance: page.autoAdvance ?? null,
            routes: page.routes ?? null,
          })
          .returning({ id: calcPages.id });
        if (page.id) pageIdMap.set(page.id, savedPage.id);
      }

      if (fields.length > 0) {
        const keys = new Set<string>();
        for (const field of fields) {
          if (keys.has(field.key)) {
            throw new UnprocessableEntityException(
              `Duplicate field key: ${field.key}`,
            );
          }
          keys.add(field.key);
        }
      }

      await tx.insert(calcFields).values(
        fields.map((field) => ({
          calculatorId: calcId,
          pageId: field.pageId ? (pageIdMap.get(field.pageId) ?? null) : null,
          type: field.type,
          label: field.label,
          key: field.key,
          orderIndex: field.orderIndex,
          rowId: field.rowId,
          config: field.config ?? {},
          formula: field.formula ?? null,
          visibility: field.visibility ?? null,
        })),
      );
    });
  }

  private makeSlug(input: string): string {
    const cleaned = input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    return cleaned || 'calculator';
  }
}
