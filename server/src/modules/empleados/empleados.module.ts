import { Module } from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { EmpleadosController } from './empleados.controller';
import { PrismaService } from '../../common/database/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EmpleadosController],
  providers: [EmpleadosService, PrismaService],
  exports: [EmpleadosService],
})
export class EmpleadosModule {}
