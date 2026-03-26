import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { PenaltyContractExcludedPeriodDto } from './penalty-contract-excluded-period.dto';
import { PenaltyContractPartialPaymentDto } from './penalty-contract-partial-payment.dto';
import { PenaltyContractAdditionalDebtDto } from './penalty-contract-additional-debt.dto';

const RATE_TYPES = [
  'percent_per_year',
  'percent_per_day',
  'fixed_per_day',
] as const;
const LIMIT_TYPES = ['fixed', 'percent'] as const;

export class PenaltyContractCalculateInputDto {
  @ApiProperty({
    example: 500_000,
    minimum: 0,
    description: 'Сумма задолженности, руб.',
  })
  @IsNumber()
  @Min(0)
  sum!: number;

  @ApiProperty({ example: '2025-01-01', description: 'С даты' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2025-02-27', description: 'По дату' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    example: false,
    description: 'Только рабочие дни (производственный календарь РФ)',
  })
  @IsBoolean()
  workdaysOnly!: boolean;

  @ApiProperty({ enum: RATE_TYPES, description: 'Тип ставки' })
  @IsIn(RATE_TYPES)
  rateType!: (typeof RATE_TYPES)[number];

  @ApiProperty({
    example: 0.1,
    minimum: 0,
    description: 'Значение ставки (% или руб/день)',
  })
  @IsNumber()
  @Min(0)
  rateValue!: number;

  @ApiPropertyOptional({
    type: [PenaltyContractExcludedPeriodDto],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PenaltyContractExcludedPeriodDto)
  excludedPeriods?: PenaltyContractExcludedPeriodDto[];

  @ApiPropertyOptional({ enum: LIMIT_TYPES })
  @IsOptional()
  @IsIn(LIMIT_TYPES)
  limitType?: (typeof LIMIT_TYPES)[number];

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  limitValue?: number;

  @ApiPropertyOptional({
    type: [PenaltyContractPartialPaymentDto],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PenaltyContractPartialPaymentDto)
  partialPayments?: PenaltyContractPartialPaymentDto[];

  @ApiPropertyOptional({
    type: [PenaltyContractAdditionalDebtDto],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PenaltyContractAdditionalDebtDto)
  additionalDebts?: PenaltyContractAdditionalDebtDto[];

  @ApiPropertyOptional({
    example: false,
    description: 'Вернуть разбивку по каждому долгу',
  })
  @IsOptional()
  @IsBoolean()
  showPerDebt?: boolean;
}
