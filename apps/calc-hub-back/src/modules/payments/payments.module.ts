import { Module } from '@nestjs/common';
import { StripeWebhookController } from './stripe.webhook.controller';
import { PaymentsService } from './payments.service';

@Module({
  controllers: [StripeWebhookController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
