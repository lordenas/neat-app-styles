import { Module } from '@nestjs/common';
import { CalcBuilderController } from './calc-builder.controller';
import { CalcBuilderService } from './calc-builder.service';
import { PlanLimitsService } from './plan-limits.service';

@Module({
  controllers: [CalcBuilderController],
  providers: [CalcBuilderService, PlanLimitsService],
  exports: [CalcBuilderService, PlanLimitsService],
})
export class CalcBuilderModule {}
