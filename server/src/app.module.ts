import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AreasModule } from './modules/areas/areas.module';
import { KpisModule } from './modules/kpis/kpis.module';
import { EmpleadosModule } from './modules/empleados/empleados.module';
// import { EvaluacionesModule } from './modules/evaluaciones/evaluaciones.module'; // ← COMENTAR
// import { ValidacionesModule } from './modules/validaciones/validaciones.module'; // ← COMENTAR
import { EstadisticasModule } from './modules/estadisticas/estadisticas.module';
import { AlertasModule } from './modules/alertas/alertas.module';
// import { PlanesAccionModule } from './modules/planes-accion/planes-accion.module'; // ← COMENTAR
import { PrismaService } from './common/database/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    AreasModule,
    KpisModule,
    EmpleadosModule,
    // EvaluacionesModule, // ← COMENTADO
    // ValidacionesModule, // ← COMENTADO
    EstadisticasModule,
    AlertasModule,
    // PlanesAccionModule, // ← COMENTADO
  ],
  providers: [PrismaService],
})
export class AppModule {}
