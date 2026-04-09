import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';

@Module({
  imports: [AnalyticsModule],
  controllers: [WidgetController],
  providers: [WidgetService],
})
export class WidgetModule {}
