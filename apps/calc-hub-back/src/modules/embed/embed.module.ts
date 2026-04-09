import { Module } from '@nestjs/common';
import { CalcBuilderModule } from '../calc-builder/calc-builder.module';
import { EmbedController } from './embed.controller';
import { EmbedService } from './embed.service';

@Module({
  imports: [CalcBuilderModule],
  controllers: [EmbedController],
  providers: [EmbedService],
  exports: [EmbedService],
})
export class EmbedModule {}
