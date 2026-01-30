import { Module } from '@nestjs/common';
import { PlanesAccionService } from './planes-accion.service';
import { PlanesAccionController } from './planes-accion.controller';
import { PrismaService } from '../../common/database/prisma.service';

@Module({
  controllers: [PlanesAccionController],
  providers: [PlanesAccionService, PrismaService],
  exports: [PlanesAccionService],
})
export class PlanesAccionModule {}