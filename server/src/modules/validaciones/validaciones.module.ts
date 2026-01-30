import { Module } from '@nestjs/common';
import { ValidacionesService } from './validaciones.service';
import { ValidacionesController } from './validaciones.controller';
import { PrismaService } from '../../common/database/prisma.service';
import { PlanesAccionModule } from '../planes-accion/planes-accion.module';

@Module({
    imports: [PlanesAccionModule],
    controllers: [ValidacionesController],
    providers: [ValidacionesService, PrismaService],
    exports: [ValidacionesService],
})
export class ValidacionesModule {}