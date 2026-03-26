import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiOkResponse({
    schema: { example: { status: 'ok', uptimeSec: 1234 } },
  })
  @Get()
  getHealth(): { status: string; uptimeSec: number } {
    return this.appService.getHealth();
  }
}
