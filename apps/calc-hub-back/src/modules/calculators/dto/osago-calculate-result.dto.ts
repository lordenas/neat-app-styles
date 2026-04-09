import { ApiProperty } from '@nestjs/swagger';

/**
 * Структура result для расчёта ОСАГО в ответе POST /api/v1/calculate/osago.
 */
export class OsagoCalculateResultDto {
  @ApiProperty({ example: 4942 })
  baseTariff!: number;

  @ApiProperty({ example: 1.9, description: 'КТ — коэффициент территории' })
  kt!: number;

  @ApiProperty({ example: 1.01, description: 'КВС — возраст/стаж' })
  kvs!: number;

  @ApiProperty({ example: 1, description: 'КБМ — бонус-малус' })
  kbm!: number;

  @ApiProperty({ example: 1.2, description: 'КМ — мощность двигателя' })
  km!: number;

  @ApiProperty({ example: 1, description: 'КС — период использования' })
  ks!: number;

  @ApiProperty({ example: 1, description: 'КО — ограничение водителей' })
  ko!: number;

  @ApiProperty({
    example: 11234,
    description: 'Итоговая стоимость полиса (руб.)',
  })
  total!: number;
}
