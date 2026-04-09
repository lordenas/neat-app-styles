import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: 'Get daily activity stats (last 30 days)' })
  @ApiOkResponse({ description: 'Daily grouped analytics events' })
  @Get('daily')
  daily() {
    return this.analyticsService.dailyActivity();
  }

  @ApiOperation({ summary: 'Get top event types' })
  @ApiOkResponse({ description: 'Top analytics event types by count' })
  @Get('top')
  top() {
    return this.analyticsService.topEventTypes();
  }

  @ApiOperation({ summary: 'Get latest analytics events for current user' })
  @ApiOkResponse({ description: 'Latest events related to current user' })
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.analyticsService.byUser(user.id);
  }
}
