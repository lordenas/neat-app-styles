import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../db/database.service';
import { paymentEvents } from '../../db/schema';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  async handleStripeWebhook(payload: Record<string, unknown>) {
    const eventId = typeof payload.id === 'string' ? payload.id : 'unknown';
    await this.dbService.db.insert(paymentEvents).values({
      provider: 'stripe',
      providerEventId: eventId,
      status: typeof payload.type === 'string' ? payload.type : 'unknown',
      payload,
    });
    return { ok: true };
  }

  async handleRobokassaWebhook(payload: Record<string, unknown>) {
    const eventId =
      typeof payload.InvId === 'string'
        ? payload.InvId
        : typeof payload.id === 'string'
          ? payload.id
          : 'unknown';
    await this.dbService.db.insert(paymentEvents).values({
      provider: 'robokassa',
      providerEventId: eventId,
      status: 'processed',
      payload,
    });
    return { ok: true };
  }

  getPaymentConfig() {
    return {
      stripeConfigured: Boolean(
        this.configService.get<string>('STRIPE_SECRET_KEY'),
      ),
      robokassaConfigured: Boolean(
        this.configService.get<string>('ROBOKASSA_PASSWORD_1'),
      ),
    };
  }
}
