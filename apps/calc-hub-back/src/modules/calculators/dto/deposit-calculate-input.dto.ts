import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { DepositOneTimeTopUpDto } from './deposit-one-time-top-up.dto';
import { DepositRegularTopUpDto } from './deposit-regular-top-up.dto';
import { DepositOneTimeWithdrawalDto } from './deposit-one-time-withdrawal.dto';
import { DepositRegularWithdrawalDto } from './deposit-regular-withdrawal.dto';

export class DepositCalculateInputDto {
  @ApiProperty({
    example: 1_000_000,
    minimum: 0,
    description: 'Начальная сумма вклада, ₽',
  })
  @IsNumber()
  @Min(0)
  principal!: number;

  @ApiProperty({
    example: '2026-02-27',
    description: 'Дата начала вклада YYYY-MM-DD',
  })
  @IsString()
  startDate!: string;

  @ApiProperty({ example: 12, minimum: 1, description: 'Срок' })
  @IsNumber()
  @Min(1)
  term!: number;

  @ApiProperty({ enum: ['days', 'months', 'years'] })
  @IsIn(['days', 'months', 'years'])
  termUnit!: string;

  @ApiProperty({ example: 18, minimum: 0, description: 'Ставка, % годовых' })
  @IsNumber()
  @Min(0)
  annualRatePercent!: number;

  @ApiProperty({ description: 'С капитализацией процентов' })
  @IsBoolean()
  capitalization!: boolean;

  @ApiProperty({
    enum: ['1D', '1W', '1M', '3M', '6M', '1Y'],
    description: 'Периодичность капитализации',
  })
  @IsIn(['1D', '1W', '1M', '3M', '6M', '1Y'])
  compoundFrequency!: string;

  @ApiProperty({
    enum: ['end', '1D', '1W', '1M', '3M', '6M', '1Y'],
    description: 'Выплата процентов (при отсутствии капитализации)',
  })
  @IsIn(['end', '1D', '1W', '1M', '3M', '6M', '1Y'])
  payoutFrequency!: string;

  @ApiPropertyOptional({ type: [DepositOneTimeTopUpDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepositOneTimeTopUpDto)
  oneTimeTopUps?: DepositOneTimeTopUpDto[];

  @ApiPropertyOptional({ type: [DepositRegularTopUpDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepositRegularTopUpDto)
  regularTopUps?: DepositRegularTopUpDto[];

  @ApiPropertyOptional({ type: [DepositOneTimeWithdrawalDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepositOneTimeWithdrawalDto)
  oneTimeWithdrawals?: DepositOneTimeWithdrawalDto[];

  @ApiPropertyOptional({ type: [DepositRegularWithdrawalDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepositRegularWithdrawalDto)
  regularWithdrawals?: DepositRegularWithdrawalDto[];

  @ApiPropertyOptional({
    example: 0,
    minimum: 0,
    default: 0,
    description: 'Минимальный остаток (снятия ниже блокируются)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumBalance?: number;

  @ApiPropertyOptional({
    example: 16,
    minimum: 0,
    description: 'Ключевая ставка ЦБ, % (для необлагаемого порога)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  keyRatePercent?: number;

  @ApiPropertyOptional({ description: 'Ключевая ставка по годам (год -> %)' })
  @IsOptional()
  @IsObject()
  keyRatesByYear?: Record<string, number>;

  @ApiPropertyOptional({
    example: 13,
    minimum: 0,
    maximum: 100,
    default: 13,
    description: 'Ставка НДФЛ, %',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRatePercent?: number;
}
