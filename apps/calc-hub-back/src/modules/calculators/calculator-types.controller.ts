import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CalculatorsService } from './calculators.service';

@ApiTags('Calculators')
@Controller('v1/calculators')
export class CalculatorTypesController {
  constructor(private readonly calculatorsService: CalculatorsService) {}

  @Get('types')
  @ApiOperation({ summary: 'List available calculator types' })
  @ApiOkResponse({
    description: 'Array of calculator type identifiers (e.g. vat, osago)',
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: ['osago', 'vat'],
    },
  })
  getTypes(): Promise<string[]> {
    return this.calculatorsService.getAvailableTypes();
  }
}
