import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class UpsertPageDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  autoAdvance?: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  routes?: Record<string, unknown>[] | null;

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
