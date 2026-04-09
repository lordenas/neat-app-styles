import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { OtpusknyePartialMonthDto } from './otpusknye-partial-month.dto';

export class OtpusknyeCalculateInputDto {
  @ApiProperty({
    example: 720_000,
    minimum: 0,
    description: 'Заработок за расчётный период (12 мес.), руб.',
  })
  @IsNumber()
  @Min(0)
  totalEarnings!: number;

  @ApiProperty({
    example: 10,
    minimum: 0,
    maximum: 12,
    description: 'Полных отработанных месяцев',
  })
  @IsInt()
  @Min(0)
  @Max(12)
  fullMonths!: number;

  @ApiPropertyOptional({
    type: [OtpusknyePartialMonthDto],
    description: 'Неполные месяцы (больничный, отпуск без содержания и т.п.)',
    default: [],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OtpusknyePartialMonthDto)
  partialMonths?: OtpusknyePartialMonthDto[];

  @ApiProperty({ example: 28, minimum: 1, description: 'Дней отпуска' })
  @IsInt()
  @Min(1)
  vacationDays!: number;
}
