import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class LoanInterestRateChangeDto {
  @ApiProperty({
    example: '2026-06-01',
    description: 'Дата смены ставки YYYY-MM-DD',
  })
  @IsString()
  date!: string;

  @ApiProperty({ example: 12, minimum: 0, description: 'Ставка, % годовых' })
  @IsNumber()
  @Min(0)
  ratePercent!: number;
}
