import { IsDateString, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveCalculationDto {
  @ApiProperty({ example: 'vat-gst' })
  @IsString()
  calculatorSlug!: string;

  @ApiProperty({ example: 'GLB' })
  @IsString()
  regionCode!: string;

  @ApiProperty({ example: '2026-02-27T00:00:00.000Z' })
  @IsDateString()
  calculationDate!: string;

  @ApiProperty({ example: { amount: 1000, rate: 20 } })
  @IsObject()
  input!: Record<string, unknown>;

  @ApiProperty({
    example: {
      outputs: { tax: 200, total: 1200 },
      engineMeta: { version: '1.0.0', traceEnabled: false },
    },
  })
  @IsObject()
  result!: Record<string, unknown>;

  @ApiProperty({ example: '1.0.0' })
  @IsString()
  formulaVersion!: string;
}
