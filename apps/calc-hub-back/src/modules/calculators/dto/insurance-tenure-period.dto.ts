import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class InsuranceTenurePeriodDto {
  @ApiProperty({
    example: '2015-03-01',
    description: 'Дата начала периода YYYY-MM-DD',
  })
  @IsString()
  startDate!: string;

  @ApiProperty({
    example: '2020-06-15',
    description: 'Дата окончания периода YYYY-MM-DD',
  })
  @IsString()
  endDate!: string;
}
