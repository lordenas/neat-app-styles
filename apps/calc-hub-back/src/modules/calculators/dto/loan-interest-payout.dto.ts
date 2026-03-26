import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class LoanInterestPayoutDto {
  @ApiProperty({
    example: '2026-05-15',
    description: 'Дата выплаты YYYY-MM-DD',
  })
  @IsString()
  date!: string;

  @ApiProperty({ example: 100_000, minimum: 0 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}
