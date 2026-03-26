import { ApiProperty } from '@nestjs/swagger';

export class InsuranceTenureCalculateResultDto {
  @ApiProperty()
  totalYears!: number;

  @ApiProperty()
  totalMonths!: number;

  @ApiProperty()
  totalDays!: number;

  @ApiProperty({ description: 'Общее количество дней' })
  rawDays!: number;

  @ApiProperty({
    enum: [60, 80, 100],
    description: 'Процент оплаты больничного',
  })
  sickPayPercent!: 60 | 80 | 100;

  @ApiProperty()
  sickPayDescription!: string;
}
