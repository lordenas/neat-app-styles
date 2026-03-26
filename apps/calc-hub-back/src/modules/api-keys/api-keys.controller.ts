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
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@ApiTags('API Keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @ApiOperation({ summary: 'List active API keys of current user' })
  @ApiOkResponse({
    schema: {
      example: [
        {
          id: 'uuid',
          name: 'Production key',
          createdAt: '2026-02-27T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'JWT token is missing or invalid' })
  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.apiKeysService.list(user.id);
  }

  @ApiOperation({ summary: 'Create new API key' })
  @ApiBody({ type: CreateApiKeyDto })
  @ApiOkResponse({
    schema: {
      example: { id: 'uuid', name: 'Production key', apiKey: 'ck_...' },
    },
  })
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateApiKeyDto) {
    return this.apiKeysService.create(user.id, dto);
  }

  @ApiOperation({ summary: 'Revoke API key by id' })
  @ApiParam({ name: 'id', description: 'API key id (uuid)' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.apiKeysService.revoke(user.id, id);
  }
}
