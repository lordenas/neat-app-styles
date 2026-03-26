import { Injectable } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import { DatabaseService } from '../../db/database.service';
import { analyticsEvents } from '../../db/schema';

@Injectable()
export class AnalyticsService {
  constructor(private readonly dbService: DatabaseService) {}

  async track(
    eventType: string,
    payload: Record<string, unknown>,
    userId?: string,
    calculatorId?: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.dbService.db.insert(analyticsEvents).values({
      userId: userId ?? null,
      eventType,
      calculatorId: calculatorId ?? null,
      payload,
      ipAddress: ipAddress ?? null,
    });
  }

  async dailyActivity() {
    return this.dbService.db
      .select({
        day: sql<string>`date_trunc('day', ${analyticsEvents.createdAt})::text`,
        count: sql<number>`count(*)::int`,
      })
      .from(analyticsEvents)
      .groupBy(sql`date_trunc('day', ${analyticsEvents.createdAt})`)
      .orderBy(desc(sql`date_trunc('day', ${analyticsEvents.createdAt})`))
      .limit(30);
  }

  async topEventTypes() {
    return this.dbService.db
      .select({
        eventType: analyticsEvents.eventType,
        count: sql<number>`count(*)::int`,
      })
      .from(analyticsEvents)
      .groupBy(analyticsEvents.eventType)
      .orderBy(desc(sql`count(*)`))
      .limit(10);
  }

  async byUser(userId: string) {
    return this.dbService.db.query.analyticsEvents.findMany({
      where: eq(analyticsEvents.userId, userId),
      orderBy: [desc(analyticsEvents.createdAt)],
      limit: 100,
    });
  }
}
