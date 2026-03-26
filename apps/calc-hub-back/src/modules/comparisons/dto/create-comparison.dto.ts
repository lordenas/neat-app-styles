import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateComparisonDto {
  @ApiProperty({
    type: [String],
    example: [
      '8b4b6df5-30e8-4f91-b9c5-ef18dca1ba57',
      '14cc9f5e-7a34-4fea-a6c8-47fcfd1a2ca3',
    ],
  })
  @IsArray()
  @ArrayMinSize(2)
  @IsUUID('4', { each: true })
  calculationIds!: string[];
}
