import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EvaluacionesService } from './evaluaciones.service';
import { ConfiguracionService } from '../../common/configuracion/configuracion.service';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

@Injectable()
export class EvaluacionesCron {
  private readonly logger = new Logger(EvaluacionesCron.name);

  constructor(
    private evaluacionesService: EvaluacionesService,
    private configuracion: ConfiguracionService,
  ) {}

  // Corre todos los días a las 23:50.
  // El cierre se ejecuta el día (DIAS_GRACIA + 1) del mes — tras vencer la ventana
  // de gracia para subir respaldos a KPIs basados en órdenes de trabajo.
  @Cron('0 50 23 * * *')
  async handleCierresPeriodo() {
    const diasGracia = await this.configuracion.getDiasGracia();
    const hoy = new Date();

    if (hoy.getDate() !== diasGracia + 1) return;

    // Cerramos el mes anterior al actual (la gracia ya venció).
    const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const anio = mesAnterior.getFullYear();
    const mes0 = mesAnterior.getMonth(); // 0..11

    // Mensual — siempre
    await this.cerrar('mensual', MESES[mes0], anio);

    // Trimestral — si el mes anterior fue marzo(2) / junio(5) / sep(8) / dic(11)
    if ([2, 5, 8, 11].includes(mes0)) {
      const trimestre = Math.floor(mes0 / 3) + 1;
      await this.cerrar('trimestral', `trimestre_${trimestre}`, anio);
    }

    // Semestral — si el mes anterior fue junio(5) o diciembre(11)
    if ([5, 11].includes(mes0)) {
      const semestre = mes0 < 6 ? 1 : 2;
      await this.cerrar('semestral', `semestre_${semestre}`, anio);
    }

    // Anual — si el mes anterior fue diciembre(11)
    if (mes0 === 11) {
      await this.cerrar('anual', 'anual', anio);
    }
  }

  private async cerrar(periodicidad: string, periodo: string, anio: number) {
    this.logger.log(`📅 Cierre automático ${periodicidad}: ${periodo} ${anio}`);
    try {
      const resultado = await this.evaluacionesService.cerrarPeriodoAuto(
        periodicidad,
        periodo,
        anio,
      );
      this.logger.log(
        `✅ Cierre ${periodicidad} completado: ${resultado.evaluacionesCreadas} evaluaciones creadas`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error en cierre automático ${periodicidad} ${periodo} ${anio}:`,
        error.message,
      );
    }
  }
}
