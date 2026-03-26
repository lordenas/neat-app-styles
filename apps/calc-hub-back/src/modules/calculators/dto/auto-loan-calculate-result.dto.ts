import { ApiProperty } from '@nestjs/swagger';

/**
 * Строка графика платежей для автокредита.
 */
export class AutoLoanScheduleRowDto {
  @ApiProperty({ example: 1 })
  month!: number;

  @ApiProperty({ example: 35566.67 })
  payment!: number;

  @ApiProperty({ example: 29566.67, description: 'Основной долг' })
  principal!: number;

  @ApiProperty({ example: 6000, description: 'Проценты' })
  interest!: number;

  @ApiProperty({ example: 1570433.33, description: 'Остаток долга' })
  balance!: number;
}

/**
 * Структура result для расчёта автокредита в ответе POST /api/v1/calculate/auto-loan.
 */
export class AutoLoanCalculateResultDto {
  @ApiProperty({ example: 1_600_000, description: 'Сумма кредита, руб.' })
  loanAmount!: number;

  @ApiProperty({ example: 35566.67, description: 'Ежемесячный платёж, руб.' })
  monthlyPayment!: number;

  @ApiProperty({ example: 2_134_000, description: 'Всего к выплате, руб.' })
  totalPayment!: number;

  @ApiProperty({
    example: 534_000,
    description: 'Переплата по процентам, руб.',
  })
  totalInterest!: number;

  @ApiProperty({
    type: [AutoLoanScheduleRowDto],
    description: 'График платежей по месяцам',
  })
  schedule!: AutoLoanScheduleRowDto[];
}
