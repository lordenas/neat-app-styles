import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertFieldDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  pageId?: string;

  @ApiProperty({ example: 'number' })
  @IsString()
  type!: string;

  @ApiProperty({ example: 'Amount' })
  @IsString()
  @MaxLength(255)
  label!: string;

  @ApiProperty({ example: 'amount' })
  @IsString()
  @MaxLength(128)
  key!: string;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  orderIndex!: number;

  @ApiProperty({ example: 'row-1' })
  @IsString()
  rowId!: string;

  @ApiProperty({ type: Object, example: { min: 0, max: 1000000 } })
  @IsObject()
  config!: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'round({amount} * {rate} / 100, 2)' })
  @IsOptional()
  @IsString()
  formula?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  visibility?: Record<string, unknown> | null;

  /** Allowed so client can send full object from GET (ignored on server). */
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  calculatorId?: string;

  /** Allowed so client can send full object from GET (ignored on server). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  createdAt?: string;
}
