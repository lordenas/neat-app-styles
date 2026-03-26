import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePlanDto {
  @ApiProperty({
    enum: ['free', 'pro_500', 'pro_1000', 'pro_5000'],
    example: 'pro_500',
  })
  @IsIn(['free', 'pro_500', 'pro_1000', 'pro_5000'])
  plan!: 'free' | 'pro_500' | 'pro_1000' | 'pro_5000';
}
