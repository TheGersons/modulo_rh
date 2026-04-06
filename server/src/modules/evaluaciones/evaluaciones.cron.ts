import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EvaluacionesService } from './evaluaciones.service';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function esUltimoDiaDelMes(fecha: Date): boolean {
  const manana = new Date(fecha);
  manana.setDate(manana.getDate() + 1);
  return manana.getDate() === 1;
}

@Injectable()
export class EvaluacionesCron {
  private readonly logger = new Logger(EvaluacionesCron.name);

  constructor(private evaluacionesService: EvaluacionesService) {}

  // Corre todos los días a las 23:50 — detecta si es fin de período
  @Cron('0 50 23 * * *')
  async handleCierresPeriodo() {
    const hoy = new Date();

    if (!esUltimoDiaDelMes(hoy)) return;

    const anio = hoy.getFullYear();
    const mes = hoy.getMonth(); // 0 = enero … 11 = diciembre

    // Mensual — cierre todos los fines de mes
    await this.cerrar('mensual', MESES[mes], anio);

    // Trimestral — fin de marzo(2), junio(5), septiembre(8), diciembre(11)
    if ([2, 5, 8, 11].includes(mes)) {
      const trimestre = Math.floor(mes / 3) + 1;
      await this.cerrar('trimestral', `trimestre_${trimestre}`, anio);
    }

    // Semestral — fin de junio(5) y diciembre(11)
    if ([5, 11].includes(mes)) {
      const semestre = mes < 6 ? 1 : 2;
      await this.cerrar('semestral', `semestre_${semestre}`, anio);
    }

    // Anual — fin de diciembre
    if (mes === 11) {
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
