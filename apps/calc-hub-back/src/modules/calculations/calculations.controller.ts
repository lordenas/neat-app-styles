import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
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
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { PdfService } from '../pdf/pdf.service';
import { CalculationsService } from './calculations.service';
import { SaveCalculationDto } from './dto/save-calculation.dto';

@ApiTags('Calculations')
@Controller()
export class CalculationsController {
  constructor(
    private readonly calculationsService: CalculationsService,
    private readonly pdfService: PdfService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save calculation result' })
  @ApiBody({ type: SaveCalculationDto })
  @ApiOkResponse({ schema: { example: { id: 'saved-calculation-uuid' } } })
  @ApiUnauthorizedResponse({ description: 'JWT token is missing or invalid' })
  @UseGuards(JwtAuthGuard)
  @Post('calculations/save')
  save(@CurrentUser() user: AuthUser, @Body() dto: SaveCalculationDto) {
    return this.calculationsService.save(user.id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List saved calculations of current user' })
  @ApiOkResponse({
    schema: {
      example: [
        {
          id: 'saved-calculation-uuid',
          userId: 'user-uuid',
          calculatorId: 'calculator-uuid',
          regionId: 'region-uuid',
          formulaId: 'formula-uuid',
          calculationDate: '2026-02-27T10:00:00.000Z',
          inputPayload: { amount: 1000, rate: 20 },
          resultPayload: { outputs: { tax: 200, total: 1200 } },
        },
      ],
    },
  })
  @UseGuards(JwtAuthGuard)
  @Get('calculations')
  list(@CurrentUser() user: AuthUser) {
    return this.calculationsService.list(user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get saved calculation by id' })
  @ApiParam({ name: 'id', description: 'Saved calculation id (uuid)' })
  @ApiOkResponse({ description: 'Saved calculation details' })
  @UseGuards(JwtAuthGuard)
  @Get('calculations/:id')
  getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.calculationsService.getOne(user.id, id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete saved calculation by id' })
  @ApiParam({ name: 'id', description: 'Saved calculation id (uuid)' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  @UseGuards(JwtAuthGuard)
  @Delete('calculations/:id')
  delete(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.calculationsService.delete(user.id, id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create public share link for saved calculation' })
  @ApiParam({ name: 'id', description: 'Saved calculation id (uuid)' })
  @ApiOkResponse({
    schema: {
      example: { token: 'public-token', url: '/api/public/public-token' },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post('calculations/:id/share')
  share(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.calculationsService.share(user.id, id);
  }

  @ApiOperation({ summary: 'Get calculation by public token' })
  @ApiParam({ name: 'token', description: 'Public share token' })
  @ApiOkResponse({ description: 'Public calculation payload' })
  @Get('public/:token')
  publicByToken(@Param('token') token: string) {
    return this.calculationsService.publicByToken(token);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate PDF report for saved calculation' })
  @ApiParam({ name: 'id', description: 'Saved calculation id (uuid)' })
  @ApiProduces('application/pdf')
  @ApiOkResponse({
    description: 'PDF binary stream',
    schema: { type: 'string', format: 'binary' },
  })
  @UseGuards(JwtAuthGuard)
  @Get('calculations/:id/pdf')
  @Header('Content-Type', 'application/pdf')
  async pdf(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const calculation = await this.calculationsService.getOne(user.id, id);
    return this.pdfService.generateCalculationPdf({
      title: `Calculation ${calculation.id}`,
      createdAt: calculation.createdAt.toISOString(),
      body: {
        input: calculation.inputPayload,
        result: calculation.resultPayload,
      },
    });
  }
}
