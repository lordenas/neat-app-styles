import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNumber, Min } from 'class-validator';

export class MicroloanCalculateInputDto {
  @ApiProperty({ example: 30_000, minimum: 0 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: 30, minimum: 1, description: 'Срок займа, дней' })
  @IsNumber()
  @Min(1)
  termDays!: number;

  @ApiProperty({ example: 0.8, minimum: 0, description: 'Ставка, %' })
  @IsNumber()
  @Min(0)
  rate!: number;

  @ApiProperty({
    enum: ['day', 'month'],
    description: 'Ставка за день или за месяц',
  })
  @IsIn(['day', 'month'])
  rateUnit!: string;

  @ApiProperty({ description: 'Учитывать просрочку' })
  @IsBoolean()
  hasOverdue!: boolean;

  @ApiProperty({
    example: 10,
    minimum: 0,
    description: 'Период просрочки (число)',
  })
  @IsNumber()
  @Min(0)
  overduePeriod!: number;

  @ApiProperty({ enum: ['days', 'months'] })
  @IsIn(['days', 'months'])
  overdueUnit!: string;

  @ApiProperty({
    example: 2,
    minimum: 0,
    description: 'Ставка за просрочку, %',
  })
  @IsNumber()
  @Min(0)
  overdueRate!: number;

  @ApiProperty({ enum: ['day', 'month'] })
  @IsIn(['day', 'month'])
  overdueRateUnit!: string;

  @ApiProperty({ example: 0, minimum: 0, description: 'Штраф, ₽' })
  @IsNumber()
  @Min(0)
  penaltyAmount!: number;
}
