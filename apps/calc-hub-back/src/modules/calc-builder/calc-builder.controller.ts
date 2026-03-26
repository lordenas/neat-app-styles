import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { StripCalculatorReadOnlyFieldsInterceptor } from './strip-calculator-readonly.interceptor';
import { CalcBuilderService } from './calc-builder.service';
import { CalculatorQueryDto } from './dto/calculator-query.dto';
import { CreateCalculatorDto } from './dto/create-calculator.dto';
import { EvaluateFormulaDto } from './dto/evaluate-formula.dto';
import { UpdateCalculatorDto } from './dto/update-calculator.dto';
import { UpsertFieldDto } from './dto/upsert-field.dto';
import { UpsertPageDto } from './dto/upsert-page.dto';

@ApiTags('Builder Calculators')
@Controller('v1')
export class CalcBuilderController {
  constructor(private readonly calcBuilderService: CalcBuilderService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List calculators for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @UseGuards(JwtAuthGuard)
  @Get('calculators')
  list(@CurrentUser() user: AuthUser, @Query() query: CalculatorQueryDto) {
    return this.calcBuilderService.list(
      user.id,
      query.page ?? 1,
      query.limit ?? 50,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get calculator by id for owner' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @UseGuards(JwtAuthGuard)
  @Get('calculators/:id')
  getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.calcBuilderService.getOne(user.id, id);
  }

  @ApiOperation({ summary: 'Get public calculator by slug' })
  @ApiParam({ name: 'slug' })
  @Get('calculators/public/:slug')
  getPublic(@Param('slug') slug: string) {
    return this.calcBuilderService.getPublicBySlug(slug);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create calculator' })
  @ApiBody({ type: CreateCalculatorDto })
  @ApiCreatedResponse({ description: 'Calculator created' })
  @UseGuards(JwtAuthGuard)
  @Post('calculators')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCalculatorDto) {
    return this.calcBuilderService.create(user.id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update calculator' })
  @ApiBody({ type: UpdateCalculatorDto })
  @ApiParam({ name: 'id', format: 'uuid' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(StripCalculatorReadOnlyFieldsInterceptor)
  @Patch('calculators/:id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCalculatorDto,
  ) {
    return this.calcBuilderService.update(user.id, id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete calculator' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @UseGuards(JwtAuthGuard)
  @Delete('calculators/:id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.calcBuilderService.remove(user.id, id);
    return;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create page' })
  @ApiParam({ name: 'calcId', format: 'uuid' })
  @ApiBody({ type: UpsertPageDto })
  @UseGuards(JwtAuthGuard)
  @Post('calculators/:calcId/pages')
  createPage(
    @CurrentUser() user: AuthUser,
    @Param('calcId') calcId: string,
    @Body() body: UpsertPageDto,
  ) {
    return this.calcBuilderService.createPage(user.id, calcId, body);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Patch page' })
  @ApiParam({ name: 'calcId', format: 'uuid' })
  @ApiParam({ name: 'pageId', format: 'uuid' })
  @ApiBody({ type: UpsertPageDto })
  @UseGuards(JwtAuthGuard)
  @Patch('calculators/:calcId/pages/:pageId')
  patchPage(
    @CurrentUser() user: AuthUser,
    @Param('calcId') calcId: string,
    @Param('pageId') pageId: string,
    @Body() body: UpsertPageDto,
  ) {
    return this.calcBuilderService.patchPage(user.id, calcId, pageId, body);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete page' })
  @ApiParam({ name: 'calcId', format: 'uuid' })
  @ApiParam({ name: 'pageId', format: 'uuid' })
  @UseGuards(JwtAuthGuard)
  @Delete('calculators/:calcId/pages/:pageId')
  async deletePage(
    @CurrentUser() user: AuthUser,
    @Param('calcId') calcId: string,
    @Param('pageId') pageId: string,
  ) {
    await this.calcBuilderService.deletePage(user.id, calcId, pageId);
    return;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create field' })
  @ApiParam({ name: 'calcId', format: 'uuid' })
  @ApiBody({ type: UpsertFieldDto })
  @UseGuards(JwtAuthGuard)
  @Post('calculators/:calcId/fields')
  createField(
    @CurrentUser() user: AuthUser,
    @Param('calcId') calcId: string,
    @Body() body: UpsertFieldDto,
  ) {
    return this.calcBuilderService.createField(user.id, calcId, body);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Patch field' })
  @ApiParam({ name: 'calcId', format: 'uuid' })
  @ApiParam({ name: 'fieldId', format: 'uuid' })
  @ApiBody({ type: UpsertFieldDto })
  @UseGuards(JwtAuthGuard)
  @Patch('calculators/:calcId/fields/:fieldId')
  patchField(
    @CurrentUser() user: AuthUser,
    @Param('calcId') calcId: string,
    @Param('fieldId') fieldId: string,
    @Body() body: UpsertFieldDto,
  ) {
    return this.calcBuilderService.patchField(user.id, calcId, fieldId, body);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete field' })
  @ApiParam({ name: 'calcId', format: 'uuid' })
  @ApiParam({ name: 'fieldId', format: 'uuid' })
  @UseGuards(JwtAuthGuard)
  @Delete('calculators/:calcId/fields/:fieldId')
  async deleteField(
    @CurrentUser() user: AuthUser,
    @Param('calcId') calcId: string,
    @Param('fieldId') fieldId: string,
  ) {
    await this.calcBuilderService.deleteField(user.id, calcId, fieldId);
    return;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Evaluate formula for builder editor' })
  @ApiBody({ type: EvaluateFormulaDto })
  @ApiOkResponse({ schema: { example: { result: 123.45 } } })
  @UseGuards(JwtAuthGuard)
  @Post('calculators/evaluate')
  evaluate(@Body() body: EvaluateFormulaDto) {
    return this.calcBuilderService.evaluateFormula(body);
  }
}
