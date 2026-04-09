import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { EmbedViewDto } from './dto/embed-view.dto';
import { EmbedService } from './embed.service';

@ApiTags('Embed')
@Controller('v1')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate embed token for calculator' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @UseGuards(JwtAuthGuard)
  @Post('calculators/:id/embed-token')
  createToken(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.embedService.createToken(user.id, id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get embed token for calculator' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @UseGuards(JwtAuthGuard)
  @Get('calculators/:id/embed-token')
  getToken(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.embedService.getToken(user.id, id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete embed token' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @UseGuards(JwtAuthGuard)
  @Delete('calculators/:id/embed-token')
  async deleteToken(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.embedService.deleteToken(user.id, id);
    return;
  }

  @ApiOperation({ summary: 'Track embed view (public)' })
  @ApiBody({ type: EmbedViewDto })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  @Post('embed/view')
  trackView(@Body() body: EmbedViewDto) {
    return this.embedService.trackView(body);
  }
}
