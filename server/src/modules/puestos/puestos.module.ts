import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { PuestosController } from './puestos.controller';
import { PuestosService } from './puestos.service';

@Module({
  controllers: [PuestosController],
  providers: [PuestosService, PrismaService],
  exports: [PuestosService],
})
export class PuestosModule {}
