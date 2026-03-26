import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class PenaltyContractPartialPaymentDto {
  @ApiPropertyOptional({ example: '2025-02-01', description: 'Дата оплаты' })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({
    example: 100000,
    minimum: 0,
    description: 'Сумма, руб.',
  })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ description: 'Комментарий' })
  @IsOptional()
  @IsString()
  comment?: string;
}
