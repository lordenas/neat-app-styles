import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class OtpusknyePartialMonthDto {
  @ApiProperty({
    example: 10,
    minimum: 0,
    description: 'Пропущено дней в месяце',
  })
  @IsInt()
  @Min(0)
  excludedDays!: number;

  @ApiProperty({
    example: 31,
    minimum: 28,
    maximum: 31,
    description: 'Дней в месяце',
  })
  @IsInt()
  @Min(28)
  @Max(31)
  totalDaysInMonth!: number;
}
