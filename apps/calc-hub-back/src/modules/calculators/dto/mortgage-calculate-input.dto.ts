import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class MortgageCalculateInputDto {
  @ApiProperty({
    example: 10_000_000,
    minimum: 0,
    description: 'Стоимость недвижимости, руб.',
  })
  @IsNumber()
  @Min(0)
  propertyPrice!: number;

  @ApiProperty({
    example: 2_000_000,
    minimum: 0,
    description: 'Первоначальный взнос, руб.',
  })
  @IsNumber()
  @Min(0)
  downPayment!: number;

  @ApiProperty({
    example: 18,
    minimum: 0.1,
    maximum: 100,
    description: 'Годовая процентная ставка, %',
  })
  @IsNumber()
  @Min(0.1)
  @Max(100)
  annualRate!: number;

  @ApiProperty({
    example: 20,
    minimum: 1,
    maximum: 30,
    description: 'Срок кредита, лет',
  })
  @IsInt()
  @Min(1)
  @Max(30)
  termYears!: number;
}
