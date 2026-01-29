import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './common/database/prisma.service';
import { AreasModule } from './modules/areas/areas.module';
import { AuthModule } from './modules/auth/auth.module';
import { KpisModule } from './modules/kpis/kpis.module';
import { EmpleadosModule } from './modules/empleados/empleados.module';
import { EvaluacionesModule } from './modules/evaluaciones/evaluaciones.module';
import { ValidacionesModule } from './modules/validaciones/validaciones.module';
import { EstadisticasModule } from './modules/estadisticas/estadisticas.module';
import { AlertasModule } from './modules/alertas/alertas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AreasModule,
    AuthModule,
    KpisModule,
    EmpleadosModule,
    EvaluacionesModule,
    ValidacionesModule,
    EstadisticasModule,
    AlertasModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}