import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class PenaltyContractAdditionalDebtDto {
  @ApiPropertyOptional({
    example: '2025-02-15',
    description: 'Дата доп. задолженности',
  })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({
    example: 50000,
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
