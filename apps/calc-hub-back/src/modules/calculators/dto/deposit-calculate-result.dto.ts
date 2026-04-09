import { ApiProperty } from '@nestjs/swagger';

export class DepositScheduleRowDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  eventType!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  amountDelta!: number;

  @ApiProperty()
  interestAccrued!: number;

  @ApiProperty()
  balance!: number;
}

export class DepositTaxRowDto {
  @ApiProperty()
  year!: number;

  @ApiProperty()
  income!: number;

  @ApiProperty()
  deduction!: number;

  @ApiProperty()
  taxableIncome!: number;

  @ApiProperty()
  taxAmount!: number;

  @ApiProperty()
  payByDate!: string;
}

export class DepositBlockedWithdrawalDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  amount!: number;
}

export class DepositCalculateResultDto {
  @ApiProperty({ description: 'Начисленные проценты' })
  totalInterest!: number;

  @ApiProperty({ description: 'Итоговый баланс' })
  finalBalance!: number;

  @ApiProperty({ description: 'Итого к получению (с процентами)' })
  totalReturn!: number;

  @ApiProperty({ description: 'Всего пополнений (включая начальную сумму)' })
  totalTopUps!: number;

  @ApiProperty({ description: 'Всего снятий' })
  totalWithdrawals!: number;

  @ApiProperty({ description: 'Чистый доход после налога' })
  netIncome!: number;

  @ApiProperty({ description: 'Эффективная ставка, % годовых' })
  effectiveRatePercent!: number;

  @ApiProperty({ type: [DepositScheduleRowDto], description: 'График событий' })
  schedule!: DepositScheduleRowDto[];

  @ApiProperty({ type: [DepositTaxRowDto], description: 'Налог по годам' })
  taxRows!: DepositTaxRowDto[];

  @ApiProperty({ description: 'Итого НДФЛ' })
  totalTax!: number;

  @ApiProperty({
    type: [DepositBlockedWithdrawalDto],
    description: 'Заблокированные снятия (ниже минимального остатка)',
  })
  blockedWithdrawals!: DepositBlockedWithdrawalDto[];
}
