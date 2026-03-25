import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AreasModule } from './modules/areas/areas.module';
import { KpisModule } from './modules/kpis/kpis.module';
import { EmpleadosModule } from './modules/empleados/empleados.module';
// import { ValidacionesModule } from './modules/validaciones/validaciones.module'; // ← COMENTAR
import { EstadisticasModule } from './modules/estadisticas/estadisticas.module';
import { AlertasModule } from './modules/alertas/alertas.module';
import { OrdenesTrabajoModule } from './modules/ordenes-trabajo/ordenes-trabajo.module';
// import { PlanesAccionModule } from './modules/planes-accion/planes-accion.module'; // ← COMENTAR
import { EvaluacionesModule } from './modules/evaluaciones/evaluaciones.module';
import { PuestosModule } from './modules/puestos/puestos.module';
import { StorageModule } from './modules/storage/storage.module';
import { RevisoresAsignadosModule } from './modules/revisores-asignados/revisores-asignados.module';
import { MiEquipoModule } from './modules/mi-equipo/mi-equipo.module';
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
    EvaluacionesModule,
    PuestosModule,
    StorageModule,
    // ValidacionesModule, // ← COMENTADO
    EstadisticasModule,
    AlertasModule,
    OrdenesTrabajoModule,
    RevisoresAsignadosModule,
    MiEquipoModule,
    // PlanesAccionModule, // ← COMENTADO
  ],
  providers: [PrismaService],
})
export class AppModule {}
