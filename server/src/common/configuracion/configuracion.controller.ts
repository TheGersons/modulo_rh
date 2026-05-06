import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConfiguracionService } from './configuracion.service';
import { PrismaService } from '../database/prisma.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import {
  enVentanaGracia,
  getVentanaGracia,
  formatPeriodo,
} from '../utils/grace-period.util';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

@Controller('configuracion')
@UseGuards(JwtAuthGuard)
export class ConfiguracionController {
  constructor(
    private configuracion: ConfiguracionService,
    private prisma: PrismaService,
  ) {}

  /**
   * Período mensual "activo" para subida de evidencias.
   *
   * Reglas:
   *  - Si el mes anterior aún NO tiene Evaluacion mensual creada (= cron no
   *    cerró todavía o falló), el período activo es el mes anterior.
   *  - En caso contrario, el período activo es el mes actual.
   *
   * Esto desacopla la UI del calendario fijo de la ventana de gracia: si por
   * cualquier razón el cron no corre el día 6 a las 23:50, los empleados
   * SIGUEN viendo el período en cierre y pueden subir respaldos hasta que
   * el cron efectivamente cierre el período.
   */
  @Get('periodo-activo')
  async getPeriodoActivo() {
    const ahora = new Date();
    const periodoActual = formatPeriodo(ahora); // "YYYY-MM"
    const mesAnteriorDate = new Date(
      ahora.getFullYear(),
      ahora.getMonth() - 1,
      1,
    );
    const periodoAnterior = formatPeriodo(mesAnteriorDate);

    const diasGracia = await this.configuracion.getDiasGracia();
    const ventanaCalendario = getVentanaGracia(periodoAnterior, diasGracia);
    const enGraciaCalendario = enVentanaGracia(
      ahora,
      periodoAnterior,
      diasGracia,
    );

    // ¿Existe ya una evaluación mensual para el mes anterior?
    const nombreMesAnterior = MESES[mesAnteriorDate.getMonth()];
    const anioAnterior = mesAnteriorDate.getFullYear();
    const evaluacionExistente = await this.prisma.evaluacion.findFirst({
      where: { periodo: nombreMesAnterior, anio: anioAnterior },
      select: { id: true },
    });

    // Si NO hay evaluación → el mes anterior sigue abierto (gracia extendida).
    const mesAnteriorAbierto = !evaluacionExistente;
    const periodoActivo = mesAnteriorAbierto ? periodoAnterior : periodoActual;
    const enGracia = periodoActivo === periodoAnterior;

    return {
      periodo: periodoActivo,
      periodoActual,
      periodoAnterior,
      enGracia,
      enGraciaCalendario,
      mesAnteriorAbierto,
      ventana: {
        inicio: ventanaCalendario.inicio.toISOString(),
        fin: ventanaCalendario.fin.toISOString(),
      },
      diasGracia,
    };
  }
}
