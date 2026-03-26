import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CreateComparisonDto } from './dto/create-comparison.dto';
import { ComparisonsService } from './comparisons.service';

@ApiTags('Comparisons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comparisons')
export class ComparisonsController {
  constructor(private readonly comparisonsService: ComparisonsService) {}

  @ApiOperation({ summary: 'Compare multiple saved calculations' })
  @ApiBody({ type: CreateComparisonDto })
  @ApiOkResponse({
    schema: {
      example: {
        comparedCount: 2,
        items: [
          {
            id: 'calc-1',
            resultPayload: { outputs: { total: 1200 } },
          },
          {
            id: 'calc-2',
            resultPayload: { outputs: { total: 1300 } },
          },
        ],
      },
    },
  })
  @Post()
  compare(@CurrentUser() user: AuthUser, @Body() dto: CreateComparisonDto) {
    return this.comparisonsService.compare(user.id, dto);
  }
}
