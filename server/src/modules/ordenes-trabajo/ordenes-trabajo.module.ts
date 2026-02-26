import { Module } from '@nestjs/common';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';
import { OrdenesTrabajoController } from './ordenes-trabajo.controller';
import { PrismaService } from '../../common/database/prisma.service';
import { AlertasModule } from '../alertas/alertas.module';

@Module({
  imports: [AlertasModule],
  controllers: [OrdenesTrabajoController],
  providers: [OrdenesTrabajoService, PrismaService],
  exports: [OrdenesTrabajoService],
})
export class OrdenesTrabajoModule {}
