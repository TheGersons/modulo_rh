import { Module } from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { EmpleadosController } from './empleados.controller';
import { PrismaService } from '../../common/database/prisma.service';

@Module({
  controllers: [EmpleadosController],
  providers: [EmpleadosService, PrismaService],
  exports: [EmpleadosService],
})
export class EmpleadosModule {}