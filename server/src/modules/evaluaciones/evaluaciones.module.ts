import { Module } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import { EvaluacionesController } from './evaluaciones.controller';
import { PrismaService } from '../../common/database/prisma.service';

@Module({
  controllers: [EvaluacionesController],
  providers: [EvaluacionesService, PrismaService],
  exports: [EvaluacionesService],
})
export class EvaluacionesModule {}