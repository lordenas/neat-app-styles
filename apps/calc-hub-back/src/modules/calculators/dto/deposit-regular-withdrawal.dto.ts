import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class DepositRegularWithdrawalDto {
  @ApiProperty({ example: '2026-04-01', description: 'Дата начала YYYY-MM-DD' })
  @IsString()
  startDate!: string;

  @ApiPropertyOptional({
    example: '2026-11-01',
    description: 'Дата окончания YYYY-MM-DD',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ enum: ['1M', '2M', '3M', '6M', '1Y'] })
  @IsIn(['1M', '2M', '3M', '6M', '1Y'])
  period!: string;

  @ApiProperty({ example: 5_000, minimum: 0 })
  @IsNumber()
  @Min(0)
  amount!: number;
}
