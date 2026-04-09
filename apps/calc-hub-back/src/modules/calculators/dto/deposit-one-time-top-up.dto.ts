import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class DepositOneTimeTopUpDto {
  @ApiProperty({
    example: '2026-06-01',
    description: 'Дата пополнения YYYY-MM-DD',
  })
  @IsString()
  date!: string;

  @ApiProperty({ example: 50_000, minimum: 0 })
  @IsNumber()
  @Min(0)
  amount!: number;
}
