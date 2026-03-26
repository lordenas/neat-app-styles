import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class AutoLoanCalculateInputDto {
  @ApiProperty({
    example: 2_000_000,
    minimum: 0,
    description: 'Стоимость автомобиля, руб.',
  })
  @IsNumber()
  @Min(0)
  carPrice!: number;

  @ApiProperty({
    example: 400_000,
    minimum: 0,
    description: 'Первоначальный взнос, руб.',
  })
  @IsNumber()
  @Min(0)
  downPayment!: number;

  @ApiProperty({
    example: 12,
    minimum: 0,
    maximum: 100,
    description: 'Годовая процентная ставка, %',
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  annualRate!: number;

  @ApiProperty({
    example: 60,
    minimum: 1,
    maximum: 120,
    description: 'Срок кредита, мес.',
  })
  @IsInt()
  @Min(1)
  @Max(120)
  termMonths!: number;
}
