import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateLeadDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  calculatorId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  calculatorTitle?: string;

  @ApiProperty({ example: 'lead@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ type: Object })
  @IsObject()
  formValues!: Record<string, unknown>;

  @ApiProperty({ type: Object })
  @IsObject()
  resultValues!: Record<string, unknown>;
}
