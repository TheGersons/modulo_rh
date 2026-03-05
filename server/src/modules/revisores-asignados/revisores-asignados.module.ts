import { Module } from '@nestjs/common';
import { RevisoresAsignadosController } from './revisores-asignados.controller';
import { RevisoresAsignadosService } from './revisores-asignados.service';
import { PrismaService } from '../../common/database/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RevisoresAsignadosController],
  providers: [RevisoresAsignadosService, PrismaService],
  exports: [RevisoresAsignadosService], // exportar para usar en KPIs service
})
export class RevisoresAsignadosModule {}
