import { PartialType } from '@nestjs/swagger';
import { CreateCalculatorDto } from './create-calculator.dto';

export class UpdateCalculatorDto extends PartialType(CreateCalculatorDto) {}
