import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, Min } from 'class-validator';

const ENGINE_TYPES = [
  'petrol',
  'diesel',
  'electric',
  'hybrid_parallel',
  'hybrid_series',
] as const;

const AGE_GROUPS = ['new', '1-3', '3-5', '5-7', '7+'] as const;

const IMPORTER_TYPES = ['individual', 'individual_resale', 'legal'] as const;

export class RastamozhkaCalculateInputDto {
  @ApiProperty({
    example: 25_000,
    minimum: 0,
    description: 'Стоимость авто в евро',
  })
  @IsNumber()
  @Min(0)
  priceEur!: number;

  @ApiProperty({
    example: 2000,
    minimum: 0,
    description: 'Объём двигателя, см³',
  })
  @IsNumber()
  @Min(0)
  engineVolume!: number;

  @ApiProperty({
    example: 150,
    minimum: 0,
    description: 'Мощность, л.с.',
  })
  @IsNumber()
  @Min(0)
  horsePower!: number;

  @ApiProperty({
    enum: ENGINE_TYPES,
    description: 'Тип двигателя',
  })
  @IsIn(ENGINE_TYPES)
  engineType!: (typeof ENGINE_TYPES)[number];

  @ApiProperty({
    enum: AGE_GROUPS,
    description: 'Возраст авто: new, 1-3, 3-5, 5-7, 7+ лет',
  })
  @IsIn(AGE_GROUPS)
  ageGroup!: (typeof AGE_GROUPS)[number];

  @ApiProperty({
    enum: IMPORTER_TYPES,
    description: 'Тип импортёра: физлицо личное / перепродажа / юрлицо',
  })
  @IsIn(IMPORTER_TYPES)
  importerType!: (typeof IMPORTER_TYPES)[number];

  @ApiProperty({
    example: 105,
    minimum: 0.01,
    description: 'Курс евро к рублю',
  })
  @IsNumber()
  @Min(0.01)
  eurRate!: number;
}
