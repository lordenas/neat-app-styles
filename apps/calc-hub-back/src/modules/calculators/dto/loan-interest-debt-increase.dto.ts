import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class LoanInterestDebtIncreaseDto {
  @ApiProperty({
    example: '2026-04-01',
    description: 'Дата увеличения долга YYYY-MM-DD',
  })
  @IsString()
  date!: string;

  @ApiProperty({ example: 50_000, minimum: 0 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}
