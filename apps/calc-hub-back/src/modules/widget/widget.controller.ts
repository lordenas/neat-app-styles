import { Body, Controller, Headers, Ip, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { WidgetConfigDto } from './dto/widget-config.dto';
import { WidgetService } from './widget.service';

@ApiTags('Widget')
@ApiBearerAuth()
@Controller('widget')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @ApiOperation({ summary: 'Create or update widget configuration' })
  @ApiBody({ type: WidgetConfigDto })
  @ApiOkResponse({ description: 'Stored widget configuration' })
  @UseGuards(JwtAuthGuard)
  @Post('config')
  config(@CurrentUser() user: AuthUser, @Body() dto: WidgetConfigDto) {
    return this.widgetService.upsertConfig(
      user.id,
      dto.apiKeyId,
      dto.allowedOrigins,
      dto.watermarkEnabled,
    );
  }

  @ApiOperation({ summary: 'Validate widget request origin and policy' })
  @ApiHeader({
    name: 'origin',
    required: true,
    description: 'Origin of incoming widget request',
  })
  @ApiOkResponse({
    schema: {
      example: {
        originAllowed: true,
        watermarkRequired: false,
        plan: 'pro_500',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post('validate')
  validate(
    @CurrentUser() user: AuthUser,
    @Headers('origin') origin: string,
    @Ip() ip: string,
  ) {
    return this.widgetService.validateRequest(user.id, origin, ip);
  }
}
