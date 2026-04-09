import { IsArray, IsBoolean, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WidgetConfigDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  apiKeyId!: string;

  @ApiProperty({
    type: [String],
    example: ['https://example.com', 'https://app.example.com'],
  })
  @IsArray()
  @IsString({ each: true })
  allowedOrigins!: string[];

  @ApiProperty({ example: true })
  @IsBoolean()
  watermarkEnabled!: boolean;
}
