import { Module } from '@nestjs/common';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';
import { PrismaService } from '../../common/database/prisma.service';

@Module({
  controllers: [AuditoriaController],
  providers: [AuditoriaService, PrismaService],
})
export class AuditoriaModule {}
