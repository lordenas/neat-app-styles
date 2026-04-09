import { Module } from '@nestjs/common';
import { FormulaDslEngineService } from './formula-dsl-engine.service';
import { FormulaDslValidatorService } from './formula-dsl-validator.service';
import { FormulaSelectorService } from './formula-selector.service';

@Module({
  providers: [
    FormulaSelectorService,
    FormulaDslValidatorService,
    FormulaDslEngineService,
  ],
  exports: [
    FormulaSelectorService,
    FormulaDslValidatorService,
    FormulaDslEngineService,
  ],
})
export class FormulasModule {}
