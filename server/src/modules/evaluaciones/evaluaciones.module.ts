import { Module } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import { EvaluacionesController } from './evaluaciones.controller';
import { PrismaService } from '../../common/database/prisma.service';
import { KpisModule } from '../kpis/kpis.module'; // ← AGREGAR

@Module({
  imports: [KpisModule], // ← AGREGAR
  controllers: [EvaluacionesController],
  providers: [EvaluacionesService, PrismaService],
  exports: [EvaluacionesService],
})
export class EvaluacionesModule {}
