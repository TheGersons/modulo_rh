import { Module } from '@nestjs/common';
import { MiEquipoController } from './mi-equipo.controller';
import { MiEquipoService } from './mi-equipo.service';
import { PrismaService } from '../../common/database/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MiEquipoController],
  providers: [MiEquipoService, PrismaService],
})
export class MiEquipoModule {}
