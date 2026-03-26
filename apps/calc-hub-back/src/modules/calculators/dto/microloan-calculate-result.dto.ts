import { ApiProperty } from '@nestjs/swagger';

export class MicroloanDailyAccrualRowDto {
  @ApiProperty()
  day!: number;

  @ApiProperty()
  interest!: number;

  @ApiProperty()
  total!: number;
}

export class MicroloanCalculateResultDto {
  @ApiProperty()
  interestAccrued!: number;

  @ApiProperty()
  totalToRepay!: number;

  @ApiProperty()
  overdueInterest!: number;

  @ApiProperty()
  overdueTotal!: number;

  @ApiProperty()
  grandTotal!: number;

  @ApiProperty({ type: [MicroloanDailyAccrualRowDto] })
  dailyAccrual!: MicroloanDailyAccrualRowDto[];
}
