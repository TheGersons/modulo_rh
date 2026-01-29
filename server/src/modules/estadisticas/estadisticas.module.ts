import { Module } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { EstadisticasController } from './estadisticas.controller';
import { PrismaService } from '../../common/database/prisma.service';

@Module({
  controllers: [EstadisticasController],
  providers: [EstadisticasService, PrismaService],
  exports: [EstadisticasService],
})
export class EstadisticasModule {}