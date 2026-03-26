import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class DepositOneTimeWithdrawalDto {
  @ApiProperty({ example: '2026-09-01', description: 'Дата снятия YYYY-MM-DD' })
  @IsString()
  date!: string;

  @ApiProperty({ example: 20_000, minimum: 0 })
  @IsNumber()
  @Min(0)
  amount!: number;
}
