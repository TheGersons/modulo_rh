import { Module } from '@nestjs/common';
import { ValidacionesService } from './validaciones.service';
import { ValidacionesController } from './validaciones.controller';
import { PrismaService } from '../../common/database/prisma.service';

@Module({
  controllers: [ValidacionesController],
  providers: [ValidacionesService, PrismaService],
  exports: [ValidacionesService],
})
export class ValidacionesModule {}