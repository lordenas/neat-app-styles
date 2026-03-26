import { Injectable, UnauthorizedException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DatabaseService } from '../../db/database.service';
import { subscriptions, widgetConfigs } from '../../db/schema';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class WidgetService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async validateRequest(userId: string, origin?: string, ipAddress?: string) {
    const [config, subscription] = await Promise.all([
      this.dbService.db.query.widgetConfigs.findFirst({
        where: eq(widgetConfigs.userId, userId),
      }),
      this.dbService.db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, userId),
      }),
    ]);

    if (!config) {
      throw new UnauthorizedException('Widget config not found');
    }

    const origins = Array.isArray(config.allowedOrigins)
      ? (config.allowedOrigins as string[])
      : [];
    const originAllowed = origin ? origins.includes(origin) : false;
    if (!originAllowed) {
      throw new UnauthorizedException('Origin is not allowed');
    }

    const watermarkRequired = !subscription?.watermarkDisabled;
    await this.analyticsService.track(
      'widget_usage',
      { origin, watermarkRequired, ipAddress },
      userId,
      undefined,
      ipAddress,
    );

    return {
      originAllowed,
      watermarkRequired,
      plan: subscription?.plan ?? 'free',
    };
  }

  async upsertConfig(
    userId: string,
    apiKeyId: string,
    allowedOrigins: string[],
    watermarkEnabled: boolean,
  ) {
    const existing = await this.dbService.db.query.widgetConfigs.findFirst({
      where: and(
        eq(widgetConfigs.userId, userId),
        eq(widgetConfigs.apiKeyId, apiKeyId),
      ),
    });
    if (existing) {
      const [updated] = await this.dbService.db
        .update(widgetConfigs)
        .set({
          allowedOrigins,
          watermarkEnabled,
          updatedAt: new Date(),
        })
        .where(eq(widgetConfigs.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await this.dbService.db
      .insert(widgetConfigs)
      .values({
        userId,
        apiKeyId,
        allowedOrigins,
        watermarkEnabled,
      })
      .returning();
    return created;
  }
}
