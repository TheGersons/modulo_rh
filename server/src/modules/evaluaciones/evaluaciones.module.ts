import { Module } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import { EvaluacionesController } from './evaluaciones.controller';
import { EvaluacionesCron } from './evaluaciones.cron';
import { PrismaService } from '../../common/database/prisma.service';
import { KpisModule } from '../kpis/kpis.module';

@Module({
  imports: [KpisModule],
  controllers: [EvaluacionesController],
  providers: [EvaluacionesService, EvaluacionesCron, PrismaService],
  exports: [EvaluacionesService],
})
export class EvaluacionesModule {}
