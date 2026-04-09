import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class DepositRegularTopUpDto {
  @ApiProperty({ example: '2026-03-01', description: 'Дата начала YYYY-MM-DD' })
  @IsString()
  startDate!: string;

  @ApiPropertyOptional({
    example: '2026-12-01',
    description: 'Дата окончания YYYY-MM-DD',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ enum: ['1M', '2M', '3M', '6M', '1Y'] })
  @IsIn(['1M', '2M', '3M', '6M', '1Y'])
  period!: string;

  @ApiProperty({ example: 10_000, minimum: 0 })
  @IsNumber()
  @Min(0)
  amount!: number;
}
