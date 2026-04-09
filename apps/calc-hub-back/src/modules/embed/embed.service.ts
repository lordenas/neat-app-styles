import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../db/database.service';
import {
  builderCalculators,
  embedTokens,
  subscriptions,
} from '../../db/schema';
import { PlanLimitsService } from '../calc-builder/plan-limits.service';

@Injectable()
export class EmbedService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly planLimitsService: PlanLimitsService,
  ) {}

  async createToken(userId: string, calculatorId: string) {
    await this.ensureOwner(userId, calculatorId);
    const token = `emb_${randomUUID().replace(/-/g, '')}`;
    const [created] = await this.dbService.db
      .insert(embedTokens)
      .values({
        userId,
        calculatorId,
        token,
      })
      .onConflictDoUpdate({
        target: embedTokens.calculatorId,
        set: {
          token,
          updatedAt: new Date(),
        },
      })
      .returning();
    const calc = await this.dbService.db.query.builderCalculators.findFirst({
      where: eq(builderCalculators.id, calculatorId),
      columns: { slug: true },
    });
    return {
      data: {
        token: created.token,
        scriptUrl: `https://yourdomain.com/widget.js?id=${calculatorId}&t=${created.token}`,
        iframeUrl: `https://yourdomain.com/c/${calc?.slug ?? ''}`,
      },
    };
  }

  async getToken(userId: string, calculatorId: string) {
    await this.ensureOwner(userId, calculatorId);
    const row = await this.dbService.db.query.embedTokens.findFirst({
      where: and(
        eq(embedTokens.userId, userId),
        eq(embedTokens.calculatorId, calculatorId),
      ),
    });
    return { data: row ?? null };
  }

  async deleteToken(userId: string, calculatorId: string) {
    await this.ensureOwner(userId, calculatorId);
    await this.dbService.db
      .delete(embedTokens)
      .where(
        and(
          eq(embedTokens.userId, userId),
          eq(embedTokens.calculatorId, calculatorId),
        ),
      );
  }

  async trackView(payload: {
    calculatorId: string;
    token?: string;
    referrer?: string;
  }) {
    const tokenRow = payload.token
      ? await this.dbService.db.query.embedTokens.findFirst({
          where: and(
            eq(embedTokens.calculatorId, payload.calculatorId),
            eq(embedTokens.token, payload.token),
          ),
        })
      : await this.dbService.db.query.embedTokens.findFirst({
          where: eq(embedTokens.calculatorId, payload.calculatorId),
        });

    if (!tokenRow) return { ok: false, reason: 'invalid_token' };

    const subscription = await this.dbService.db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, tokenRow.userId),
    });
    const limits = this.planLimitsService.getLimits(subscription?.plan);
    const maxViews =
      limits.maxCalcs === Number.MAX_SAFE_INTEGER
        ? Number.MAX_SAFE_INTEGER
        : limits.maxCalcs * 1000;
    if (tokenRow.monthlyViews >= maxViews) {
      return { ok: false, reason: 'limit_exceeded' };
    }

    await this.dbService.db
      .update(embedTokens)
      .set({
        monthlyViews: tokenRow.monthlyViews + 1,
        updatedAt: new Date(),
      })
      .where(eq(embedTokens.id, tokenRow.id));
    return { ok: true };
  }

  private async ensureOwner(userId: string, calculatorId: string) {
    const calc = await this.dbService.db.query.builderCalculators.findFirst({
      where: and(
        eq(builderCalculators.id, calculatorId),
        eq(builderCalculators.userId, userId),
      ),
      columns: { id: true },
    });
    if (!calc) throw new NotFoundException('Calculator not found');
    if (!calc.id) throw new ForbiddenException('Not owner');
  }
}
