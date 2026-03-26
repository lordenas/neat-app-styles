import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EarlyRepaymentScheduleRowDto {
  @ApiProperty()
  n!: number;

  @ApiProperty({ example: '22.03.2026' })
  date!: string;

  @ApiProperty()
  payment!: number;

  @ApiProperty()
  principal!: number;

  @ApiProperty()
  interest!: number;

  @ApiProperty()
  early!: number;

  @ApiProperty()
  balance!: number;

  @ApiProperty()
  ratePercent!: number;

  @ApiPropertyOptional({ enum: ['normal', 'holiday_none', 'holiday_interest'] })
  rowType?: string;
}

export class EarlyRepaymentCalculateResultDto {
  @ApiProperty({ type: [EarlyRepaymentScheduleRowDto] })
  baseSchedule!: EarlyRepaymentScheduleRowDto[];

  @ApiProperty({ type: [EarlyRepaymentScheduleRowDto] })
  schedule!: EarlyRepaymentScheduleRowDto[];

  @ApiProperty()
  baseMonthlyPayment!: number;

  @ApiProperty()
  finalMonthlyPayment!: number;

  @ApiProperty()
  baseTotalInterest!: number;

  @ApiProperty()
  totalInterest!: number;

  @ApiProperty()
  baseTotalPayment!: number;

  @ApiProperty()
  totalPayment!: number;

  @ApiProperty()
  totalEarlyPaid!: number;

  @ApiProperty()
  baseTermMonths!: number;

  @ApiProperty()
  actualTermMonths!: number;

  @ApiProperty()
  interestSaved!: number;

  @ApiProperty()
  termSavedMonths!: number;
}
