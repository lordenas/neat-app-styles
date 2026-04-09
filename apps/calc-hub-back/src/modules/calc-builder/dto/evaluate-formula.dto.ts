import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class EvaluateFormulaDto {
  @ApiProperty({ example: 'round(amount * rate / 100, 2)' })
  @IsString()
  formula!: string;

  @ApiProperty({ type: Object, example: { amount: 500000, rate: 15.5 } })
  @IsObject()
  values!: Record<string, number>;
}
