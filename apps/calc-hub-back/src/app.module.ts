import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './db/database.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { AuthModule } from './modules/auth/auth.module';
import { CalculationsModule } from './modules/calculations/calculations.module';
import { CalculatorsModule } from './modules/calculators/calculators.module';
import { ComparisonsModule } from './modules/comparisons/comparisons.module';
import { CalcBuilderModule } from './modules/calc-builder/calc-builder.module';
import { EmbedModule } from './modules/embed/embed.module';
import { FormulasModule } from './modules/formulas/formulas.module';
import { LeadsModule } from './modules/leads/leads.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UsersModule } from './modules/users/users.module';
import { WidgetModule } from './modules/widget/widget.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    DatabaseModule,
    AuthModule,
    ApiKeysModule,
    FormulasModule,
    CalcBuilderModule,
    CalculatorsModule,
    CalculationsModule,
    ComparisonsModule,
    EmbedModule,
    LeadsModule,
    SubscriptionsModule,
    PaymentsModule,
    WidgetModule,
    AnalyticsModule,
    PdfModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
