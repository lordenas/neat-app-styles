import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ListLeadsQueryDto } from './dto/list-leads-query.dto';
import { LeadsService } from './leads.service';

@ApiTags('Leads')
@Controller('v1/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List leads for current owner' })
  @UseGuards(JwtAuthGuard)
  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListLeadsQueryDto) {
    return this.leadsService.list(user.id, query);
  }

  @ApiOperation({ summary: 'Create lead (public)' })
  @ApiBody({ type: CreateLeadDto })
  @ApiOkResponse({ schema: { example: { id: 'lead-uuid' } } })
  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete lead by id for owner' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.leadsService.remove(user.id, id);
    return;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export leads as CSV' })
  @ApiQuery({ name: 'calculator_id', required: false })
  @ApiProduces('text/csv')
  @UseGuards(JwtAuthGuard)
  @Get('export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(
    @CurrentUser() user: AuthUser,
    @Query('calculator_id') calculatorId?: string,
  ) {
    return this.leadsService.exportCsv(user.id, calculatorId);
  }
}
