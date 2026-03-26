import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
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
import { UpdatePlanDto } from './dto/update-plan.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiOperation({ summary: 'Get current user subscription' })
  @ApiOkResponse({
    description: 'Current subscription (created as free if absent)',
  })
  @Get('current')
  current(@CurrentUser() user: AuthUser) {
    return this.subscriptionsService.getOrCreateForUser(user.id);
  }

  @ApiOperation({ summary: 'Update subscription plan' })
  @ApiBody({ type: UpdatePlanDto })
  @ApiOkResponse({ description: 'Updated subscription' })
  @Patch('plan')
  updatePlan(@CurrentUser() user: AuthUser, @Body() dto: UpdatePlanDto) {
    return this.subscriptionsService.updatePlan(user.id, dto.plan);
  }
}
