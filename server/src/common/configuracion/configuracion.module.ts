import { Global, Module } from '@nestjs/common';
import { ConfiguracionService } from './configuracion.service';
import { PrismaService } from '../database/prisma.service';

@Global()
@Module({
  providers: [ConfiguracionService, PrismaService],
  exports: [ConfiguracionService],
})
export class ConfiguracionModule {}
