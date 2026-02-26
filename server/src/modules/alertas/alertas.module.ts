import { Module } from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { AlertasController } from './alertas.controller';
import { PrismaService } from '../../common/database/prisma.service';

@Module({
  controllers: [AlertasController],
  providers: [AlertasService, PrismaService],
  exports: [AlertasService],
})
export class AlertasModule {}
