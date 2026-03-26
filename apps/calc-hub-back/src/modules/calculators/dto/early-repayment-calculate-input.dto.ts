import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class EarlyPaymentItemDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({
    example: '22.08.2026',
    description: 'Дата досрочного платежа dd.MM.yyyy',
  })
  @IsString()
  date!: string;

  @ApiProperty({ example: 300_000 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ enum: ['reduce_term', 'reduce_payment'] })
  @IsIn(['reduce_term', 'reduce_payment'])
  mode!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  recurring?: boolean;

  @ApiPropertyOptional({ enum: ['monthly', 'quarterly', 'yearly'] })
  @IsOptional()
  @IsIn(['monthly', 'quarterly', 'yearly'])
  frequency?: string;

  @ApiPropertyOptional({
    example: '22.08.2027',
    description: 'Конец периода для регулярного платежа dd.MM.yyyy',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class RateChangeItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({ example: '22.02.2027', description: 'dd.MM.yyyy' })
  @IsString()
  date!: string;

  @ApiProperty({ example: 16 })
  @IsNumber()
  @Min(0)
  @Max(100)
  ratePercent!: number;

  @ApiProperty({ enum: ['payment', 'term'] })
  @IsIn(['payment', 'term'])
  recalcMode!: string;
}

export class CreditHolidayItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({
    example: '22.05.2026',
    description: 'Начало каникул dd.MM.yyyy',
  })
  @IsString()
  startDate!: string;

  @ApiProperty({ example: 3, minimum: 1, maximum: 24 })
  @IsInt()
  @Min(1)
  @Max(24)
  months!: number;

  @ApiProperty({ enum: ['none', 'interest'] })
  @IsIn(['none', 'interest'])
  type!: string;
}

export class EarlyRepaymentCalculateInputDto {
  @ApiProperty({ example: 5_000_000, minimum: 0 })
  @IsNumber()
  @Min(0)
  loanAmount!: number;

  @ApiProperty({ example: 18, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  annualRatePercent!: number;

  @ApiProperty({ example: 180, minimum: 1, maximum: 360 })
  @IsInt()
  @Min(1)
  @Max(360)
  termMonths!: number;

  @ApiProperty({
    example: '2026-02-22',
    description: 'Дата выдачи кредита (ISO yyyy-MM-dd или dd.MM.yyyy)',
  })
  @IsString()
  issueDate!: string;

  @ApiPropertyOptional({ type: [EarlyPaymentItemDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EarlyPaymentItemDto)
  earlyPayments?: EarlyPaymentItemDto[];

  @ApiPropertyOptional({ type: [RateChangeItemDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RateChangeItemDto)
  rateChanges?: RateChangeItemDto[];

  @ApiPropertyOptional({ type: [CreditHolidayItemDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreditHolidayItemDto)
  creditHolidays?: CreditHolidayItemDto[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  firstPaymentInterestOnly?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  roundPayment?: boolean;

  @ApiPropertyOptional({ enum: ['rub', 'hundred'], default: 'rub' })
  @IsOptional()
  @IsIn(['rub', 'hundred'])
  roundTo?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  transferWeekends?: boolean;

  @ApiPropertyOptional({ enum: ['next', 'prev'], default: 'next' })
  @IsOptional()
  @IsIn(['next', 'prev'])
  transferDirection?: string;
}
