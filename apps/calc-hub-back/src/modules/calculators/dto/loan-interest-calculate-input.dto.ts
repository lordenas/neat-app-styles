import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { LoanInterestRateChangeDto } from './loan-interest-rate-change.dto';
import { LoanInterestPayoutDto } from './loan-interest-payout.dto';
import { LoanInterestDebtIncreaseDto } from './loan-interest-debt-increase.dto';

export class LoanInterestCalculateInputDto {
  @ApiProperty({ example: 500_000, minimum: 0 })
  @IsNumber()
  @Min(0)
  principal!: number;

  @ApiProperty({ example: '2025-02-27', description: 'Дата выдачи YYYY-MM-DD' })
  @IsString()
  startDate!: string;

  @ApiProperty({
    example: '2026-02-27',
    description: 'Дата возврата YYYY-MM-DD',
  })
  @IsString()
  endDate!: string;

  @ApiProperty({
    example: 10,
    minimum: 0,
    description: 'Начальная ставка, % годовых',
  })
  @IsNumber()
  @Min(0)
  initialRatePercent!: number;

  @ApiPropertyOptional({ type: [LoanInterestRateChangeDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoanInterestRateChangeDto)
  rateChanges?: LoanInterestRateChangeDto[];

  @ApiPropertyOptional({ type: [LoanInterestPayoutDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoanInterestPayoutDto)
  payouts?: LoanInterestPayoutDto[];

  @ApiPropertyOptional({ type: [LoanInterestDebtIncreaseDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoanInterestDebtIncreaseDto)
  debtIncreases?: LoanInterestDebtIncreaseDto[];

  @ApiPropertyOptional({
    default: true,
    description: 'Частичная выплата сначала в погашение процентов',
  })
  @IsOptional()
  @IsBoolean()
  payoutAppliesToInterestFirst?: boolean;
}
