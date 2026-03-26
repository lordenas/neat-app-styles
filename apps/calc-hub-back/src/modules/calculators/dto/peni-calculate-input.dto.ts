import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsNumber, Min } from 'class-validator';

const CALC_TYPES = ['tax', 'utilities', 'salary'] as const;
const PAYER_TYPES = ['individual', 'legal'] as const;

export class PeniCalculateInputDto {
  @ApiProperty({
    example: 100_000,
    minimum: 0,
    description: 'Сумма задолженности, руб.',
  })
  @IsNumber()
  @Min(0)
  debt!: number;

  @ApiProperty({
    enum: CALC_TYPES,
    description: 'Тип расчёта: налоги/взносы, ЖКХ, задержка зарплаты',
  })
  @IsIn(CALC_TYPES)
  calcType!: (typeof CALC_TYPES)[number];

  @ApiProperty({
    enum: PAYER_TYPES,
    description: 'Плательщик (для tax: физлицо/ИП или юрлицо)',
  })
  @IsIn(PAYER_TYPES)
  payerType!: (typeof PAYER_TYPES)[number];

  @ApiProperty({ example: '2025-01-27', description: 'С даты просрочки' })
  @IsDateString()
  dateFrom!: string;

  @ApiProperty({ example: '2025-02-27', description: 'По дату' })
  @IsDateString()
  dateTo!: string;
}
