import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../../db/database.service';
import { subscriptions } from '../../db/schema';

type Plan = 'free' | 'pro_500' | 'pro_1000' | 'pro_5000';

const PLAN_TO_QUOTA: Record<Plan, number> = {
  free: 100,
  pro_500: 500,
  pro_1000: 1000,
  pro_5000: 5000,
};

@Injectable()
export class SubscriptionsService {
  constructor(private readonly dbService: DatabaseService) {}

  async getOrCreateForUser(userId: string) {
    const existing = await this.dbService.db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    });
    if (existing) {
      return existing;
    }
    const [created] = await this.dbService.db
      .insert(subscriptions)
      .values({
        userId,
        plan: 'free',
        status: 'active',
        quotaPerMonth: PLAN_TO_QUOTA.free,
        watermarkDisabled: false,
      })
      .returning();
    return created;
  }

  async updatePlan(userId: string, plan: Plan) {
    const [updated] = await this.dbService.db
      .update(subscriptions)
      .set({
        plan,
        quotaPerMonth: PLAN_TO_QUOTA[plan],
        watermarkDisabled: plan !== 'free',
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId))
      .returning();
    return updated ?? this.getOrCreateForUser(userId);
  }
}
