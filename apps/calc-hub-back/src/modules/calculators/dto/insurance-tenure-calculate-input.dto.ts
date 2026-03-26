import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { InsuranceTenurePeriodDto } from './insurance-tenure-period.dto';

export class InsuranceTenureCalculateInputDto {
  @ApiProperty({
    type: [InsuranceTenurePeriodDto],
    description:
      'Периоды работы (пустые или с endDate < startDate не учитываются)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InsuranceTenurePeriodDto)
  periods!: InsuranceTenurePeriodDto[];
}
