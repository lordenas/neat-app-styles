import { Type } from 'class-transformer';
import { IsDateString, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalculateRequestDto {
  @ApiProperty({
    description: 'Region code used to select formula (e.g. GLB, RU, US)',
    example: 'GLB',
  })
  @IsString()
  regionCode!: string;

  @ApiPropertyOptional({
    description: 'Calculation date in ISO format. Defaults to now.',
    example: '2026-02-27T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  calculationDate?: string;

  @ApiProperty({
    description:
      'Calculator input payload according to calculator input schema',
    example: { amount: 1000, rate: 20, customerType: 'regular' },
  })
  @Type(() => Object)
  @IsObject()
  input!: Record<string, unknown>;
}
