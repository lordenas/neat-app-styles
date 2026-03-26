import { ApiProperty } from '@nestjs/swagger';

export class LoanInterestCalculateResultDto {
  @ApiProperty()
  totalInterest!: number;

  @ApiProperty()
  totalDebtAndInterest!: number;

  @ApiProperty()
  totalDays!: number;

  @ApiProperty({
    description:
      'Строки: period (даты, долг, дни, ставка, проценты), rate_change, payout, debt_increase',
    type: 'array',
    items: {},
  })
  rows!: unknown[];
}
