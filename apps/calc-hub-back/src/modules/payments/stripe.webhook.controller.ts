import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class StripeWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  @ApiBody({
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { id: 'evt_123', type: 'checkout.session.completed' },
    },
  })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  @Post('stripe/webhook')
  stripeWebhook(@Body() body: Record<string, unknown>) {
    return this.paymentsService.handleStripeWebhook(body);
  }

  @ApiOperation({ summary: 'Robokassa webhook endpoint' })
  @ApiBody({
    schema: {
      type: 'object',
      additionalProperties: true,
      example: { InvId: 'order-123', OutSum: '1000.00' },
    },
  })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  @Post('robokassa/webhook')
  robokassaWebhook(@Body() body: Record<string, unknown>) {
    return this.paymentsService.handleRobokassaWebhook(body);
  }

  @ApiOperation({ summary: 'Check payment providers configuration status' })
  @ApiOkResponse({
    schema: { example: { stripeConfigured: true, robokassaConfigured: false } },
  })
  @Get('status')
  status() {
    return this.paymentsService.getPaymentConfig();
  }
}
