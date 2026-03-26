import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { UpsertFieldDto } from './upsert-field.dto';
import { UpsertPageDto } from './upsert-page.dto';

export class CreateCalculatorDto {
  @ApiProperty({ example: 'Mortgage Calculator' })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'Calculate monthly mortgage payment' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  theme?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [UpsertPageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertPageDto)
  pages?: UpsertPageDto[];

  @ApiProperty({ type: [UpsertFieldDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertFieldDto)
  fields!: UpsertFieldDto[];
}
