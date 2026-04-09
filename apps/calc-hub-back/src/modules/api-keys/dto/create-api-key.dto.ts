import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({ minLength: 2, maxLength: 128, example: 'Production key' })
  @IsString()
  @Length(2, 128)
  name!: string;
}
