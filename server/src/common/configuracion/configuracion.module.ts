import { Global, Module } from '@nestjs/common';
import { ConfiguracionService } from './configuracion.service';
import { ConfiguracionController } from './configuracion.controller';
import { PrismaService } from '../database/prisma.service';

@Global()
@Module({
  controllers: [ConfiguracionController],
  providers: [ConfiguracionService, PrismaService],
  exports: [ConfiguracionService],
})
export class ConfiguracionModule {}
