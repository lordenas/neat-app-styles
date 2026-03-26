import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class EmbedViewDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  calculatorId!: string;

  @ApiProperty({ example: 'tok_xxx', required: false })
  @IsOptional()
  @IsString()
  token?: string;

  @ApiProperty({ example: 'https://example.com', required: false })
  @IsOptional()
  @IsString()
  referrer?: string;
}
