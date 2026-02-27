import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CerrarPeriodoDto } from './dto/cerrar-periodo.dto';
import { KpisService } from '../kpis/kpis.service';

@Injectable()
export class EvaluacionesService {
  constructor(
    private prisma: PrismaService,
    private kpisService: KpisService,
  ) {}

  // ============================================
  // CERRAR PERIODO Y GENERAR EVALUACIONES
  // ============================================
  async cerrarPeriodo(cerrarDto: CerrarPeriodoDto, evaluadorId: string) {
    console.log(
      `📊 Iniciando cierre de periodo ${cerrarDto.periodo} ${cerrarDto.anio}...`,
    );

    // 1. Obtener empleados a evaluar
    const whereEmpleados: any = { activo: true };
    if (cerrarDto.empleadoIds && cerrarDto.empleadoIds.length > 0) {
      whereEmpleados.id = { in: cerrarDto.empleadoIds };
    }
    if (cerrarDto.areaId) {
      whereEmpleados.areaId = cerrarDto.areaId;
    }

    const empleados = await this.prisma.user.findMany({
      where: whereEmpleados,
      include: {
        area: {
          select: {
            nombre: true,
          },
        },
      },
    });

    console.log(`👥 ${empleados.length} empleados a evaluar`);

    // 2. Calcular rango de fechas del periodo
    const { fechaInicio, fechaFin } = this.calcularRangoPeriodo(
      cerrarDto.periodo,
      cerrarDto.anio,
    );

    console.log(
      `📅 Periodo: ${fechaInicio.toISOString()} - ${fechaFin.toISOString()}`,
    );

    const evaluacionesCreadas: any[] = [];

    // 3. Por cada empleado, generar evaluación
    for (const empleado of empleados) {
      try {
        // Verificar si ya existe evaluación para este periodo
        const evaluacionExistente = await this.prisma.evaluacion.findUnique({
          where: {
            empleadoId_periodo_anio: {
              empleadoId: empleado.id,
              periodo: cerrarDto.periodo,
              anio: cerrarDto.anio,
            },
          },
        });

        if (evaluacionExistente) {
          console.log(
            `⏭️  ${empleado.nombre} ${empleado.apellido} ya tiene evaluación, saltando...`,
          );
          continue;
        }

        // Obtener órdenes completadas en el periodo
        const ordenes = await this.prisma.ordenTrabajo.findMany({
          where: {
            empleadoId: empleado.id,
            status: { in: ['completada', 'aprobada'] },
            fechaCompletada: {
              gte: fechaInicio,
              lte: fechaFin,
            },
          },
          include: {
            kpi: true,
            tareas: {
              include: {
                evidencias: true,
              },
            },
          },
        });

        if (ordenes.length === 0) {
          console.log(
            `⚠️  ${empleado.nombre} ${empleado.apellido} no tiene órdenes completadas en este periodo`,
          );
          continue;
        }

        console.log(
          `📋 ${empleado.nombre} ${empleado.apellido}: ${ordenes.length} órdenes completadas`,
        );

        // Crear evaluación
        const evaluacion = await this.prisma.evaluacion.create({
          data: {
            empleadoId: empleado.id,
            evaluadorId, // Sistema o ID del evaluador
            periodo: cerrarDto.periodo,
            anio: cerrarDto.anio,
            calculadaAutomaticamente: true,
            status: 'borrador',
          },
        });

        // Calcular detalles por KPI
        const detallesPorKpi = this.agruparOrdenesPorKpi(ordenes);
        const detallesCreados: any[] = [];

        for (const [kpiId, ordenesKpi] of Object.entries(detallesPorKpi)) {
          const kpi = ordenesKpi[0].kpi;

          // Preparar valores para cálculo
          const valores = this.extraerValoresParaCalculo(ordenesKpi, kpi);

          // Calcular resultado usando el motor de KPIs
          const resultadoCalculo = await this.kpisService.calcularResultado({
            kpiId,
            valores,
          });

          // Crear detalle de evaluación
          // resultado puede ser null si no hay datos; fallback a 0
          const resultadoFinal = resultadoCalculo.resultado ?? 0;

          const detalle = await this.prisma.evaluacionDetalle.create({
            data: {
              evaluacionId: evaluacion.id,
              kpiId,
              ordenTrabajoId: ordenesKpi[0].id, // Referencia a la primera orden
              resultadoNumerico: resultadoFinal,
              resultadoPorcentaje: resultadoFinal,
              brechaVsMeta: kpi.meta != null ? resultadoFinal - kpi.meta : null,
              estado: resultadoCalculo.estado,
              formulaUtilizada: JSON.stringify({
                tipoCalculo: kpi.tipoCalculo,
                valores,
              }),
              meta: kpi.meta,
              umbralAmarillo: kpi.umbralAmarillo,
            },
          });

          detallesCreados.push(detalle);
        }

        // Calcular promedio y KPIs rojos
        const promedioGeneral =
          detallesCreados.reduce((sum, d) => sum + d.resultadoPorcentaje, 0) /
          detallesCreados.length;
        const kpisRojos = detallesCreados.filter(
          (d) => d.estado === 'rojo',
        ).length;
        const porcentajeRojos = (kpisRojos / detallesCreados.length) * 100;

        // Actualizar evaluación
        await this.prisma.evaluacion.update({
          where: { id: evaluacion.id },
          data: {
            promedioGeneral,
            kpisRojos,
            porcentajeRojos,
            status: 'calculada',
            fechaCalculo: new Date(),
          },
        });

        evaluacionesCreadas.push({
          empleado: `${empleado.nombre} ${empleado.apellido}`,
          evaluacionId: evaluacion.id,
          ordenes: ordenes.length,
          kpisEvaluados: detallesCreados.length,
          promedio: Math.round(promedioGeneral * 100) / 100,
          kpisRojos,
        });

        console.log(
          `✅ ${empleado.nombre} ${empleado.apellido}: Promedio ${promedioGeneral.toFixed(2)}%`,
        );
      } catch (error) {
        console.error(
          `❌ Error al evaluar ${empleado.nombre} ${empleado.apellido}:`,
          error,
        );
      }
    }

    return {
      mensaje: `Cierre de periodo completado`,
      periodo: cerrarDto.periodo,
      anio: cerrarDto.anio,
      evaluacionesCreadas: evaluacionesCreadas.length,
      detalles: evaluacionesCreadas,
    };
  }

  // ============================================
  // AGRUPAR ÓRDENES POR KPI
  // ============================================
  private agruparOrdenesPorKpi(ordenes: any[]): Record<string, any[]> {
    const grupos: Record<string, any[]> = {};

    for (const orden of ordenes) {
      if (!grupos[orden.kpiId]) {
        grupos[orden.kpiId] = [];
      }
      grupos[orden.kpiId].push(orden);
    }

    return grupos;
  }

  // ============================================
  // EXTRAER VALORES PARA CÁLCULO
  // ============================================
  private extraerValoresParaCalculo(
    ordenes: any[],
    kpi: any,
  ): Record<string, any> {
    const valores: Record<string, any> = {};

    // Según el tipo de cálculo, extraer valores
    switch (kpi.tipoCalculo) {
      case 'binario':
        // Todas las órdenes completadas = cumplido
        valores.cumplido = ordenes.every((o) => o.status === 'aprobada');
        break;

      case 'division':
        // Buscar en valoresCalculo de las órdenes
        const formula = JSON.parse(kpi.formulaCalculo);

        // Sumar valores de todas las órdenes
        let numeradorTotal = 0;
        let denominadorTotal = 0;

        for (const orden of ordenes) {
          if (orden.valoresCalculo) {
            const vals = JSON.parse(orden.valoresCalculo);
            numeradorTotal += vals[formula.numerador] || 0;
            denominadorTotal += vals[formula.denominador] || 0;
          }
        }

        valores[formula.numerador] = numeradorTotal;
        valores[formula.denominador] = denominadorTotal;
        break;

      case 'conteo':
        // Contar órdenes completadas
        valores.total = ordenes.length;
        break;

      case 'porcentaje_kpis_equipo':
        // Este requiere lógica especial (obtener KPIs del equipo)
        // Por ahora, placeholder
        valores.total_kpis = 10;
        valores.kpis_verdes = 8;
        break;

      case 'dashboard_presentado':
        // Verificar si todas las órdenes están aprobadas
        valores.presentado = ordenes.every((o) => o.status === 'aprobada');
        break;

      default:
        valores.custom = ordenes.length;
    }

    return valores;
  }

  // ============================================
  // CALCULAR RANGO DE FECHAS DEL PERIODO
  // ============================================
  private calcularRangoPeriodo(
    periodo: string,
    anio: number,
  ): { fechaInicio: Date; fechaFin: Date } {
    let fechaInicio: Date;
    let fechaFin: Date;

    // Meses
    const meses = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];

    const mesIndex = meses.indexOf(periodo);

    if (mesIndex !== -1) {
      fechaInicio = new Date(anio, mesIndex, 1);
      fechaFin = new Date(anio, mesIndex + 1, 0, 23, 59, 59);
    }
    // Trimestres
    else if (periodo.startsWith('trimestre_')) {
      const trimestre = parseInt(periodo.split('_')[1]);
      const mesInicio = (trimestre - 1) * 3;
      fechaInicio = new Date(anio, mesInicio, 1);
      fechaFin = new Date(anio, mesInicio + 3, 0, 23, 59, 59);
    }
    // Semestres
    else if (periodo.startsWith('semestre_')) {
      const semestre = parseInt(periodo.split('_')[1]);
      const mesInicio = (semestre - 1) * 6;
      fechaInicio = new Date(anio, mesInicio, 1);
      fechaFin = new Date(anio, mesInicio + 6, 0, 23, 59, 59);
    }
    // Anual
    else if (periodo === 'anual') {
      fechaInicio = new Date(anio, 0, 1);
      fechaFin = new Date(anio, 11, 31, 23, 59, 59);
    } else {
      throw new BadRequestException(`Periodo no válido: ${periodo}`);
    }

    return { fechaInicio, fechaFin };
  }

  // ============================================
  // LISTAR EVALUACIONES
  // ============================================
  async findAll(filters?: {
    empleadoId?: string;
    periodo?: string;
    anio?: number;
    status?: string;
  }) {
    const where: any = {};

    if (filters?.empleadoId) where.empleadoId = filters.empleadoId;
    if (filters?.periodo) where.periodo = filters.periodo;
    if (filters?.anio) where.anio = filters.anio;
    if (filters?.status) where.status = filters.status;

    const evaluaciones = await this.prisma.evaluacion.findMany({
      where,
      include: {
        empleado: {
          select: {
            nombre: true,
            apellido: true,
            puesto: {
              select: { nombre: true },
            },
            area: {
              select: {
                nombre: true,
              },
            },
          },
        },
        detalles: {
          include: {
            kpi: {
              select: {
                key: true,
                indicador: true,
                tipoCriticidad: true,
              },
            },
          },
        },
      },
      orderBy: [{ anio: 'desc' }, { createdAt: 'desc' }],
    });

    return evaluaciones;
  }

  // ============================================
  // OBTENER EVALUACIÓN POR ID
  // ============================================
  async findOne(id: string) {
    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id },
      include: {
        empleado: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            puesto: {
              select: { nombre: true },
            },
            area: {
              select: {
                nombre: true,
              },
            },
          },
        },
        evaluador: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        detalles: {
          include: {
            kpi: true,
          },
          orderBy: { estado: 'desc' }, // Rojos primero
        },
      },
    });

    if (!evaluacion) {
      throw new NotFoundException(`Evaluación con ID ${id} no encontrada`);
    }

    return evaluacion;
  }

  // ============================================
  // CERRAR EVALUACIÓN (FINALIZAR)
  // ============================================
  async cerrarEvaluacion(id: string) {
    const evaluacion = await this.findOne(id);

    if (evaluacion.status === 'cerrada') {
      throw new BadRequestException('Esta evaluación ya está cerrada');
    }

    return this.prisma.evaluacion.update({
      where: { id },
      data: {
        status: 'cerrada',
        fechaCierre: new Date(),
      },
    });
  }

  // ============================================
  // RECALCULAR EVALUACIÓN
  // ============================================
  async recalcular(evaluacionId: string) {
    const evaluacion = await this.findOne(evaluacionId);

    if (evaluacion.status === 'cerrada') {
      throw new BadRequestException(
        'No se puede recalcular una evaluación cerrada',
      );
    }

    // Recalcular promedio y KPIs rojos
    const detalles = evaluacion.detalles;
    const promedioGeneral =
      detalles.reduce((sum, d) => sum + (d.resultadoPorcentaje || 0), 0) /
      detalles.length;
    const kpisRojos = detalles.filter((d) => d.estado === 'rojo').length;
    const porcentajeRojos = (kpisRojos / detalles.length) * 100;

    return this.prisma.evaluacion.update({
      where: { id: evaluacionId },
      data: {
        promedioGeneral,
        kpisRojos,
        porcentajeRojos,
      },
    });
  }

  // ============================================
  // ELIMINAR EVALUACIÓN
  // ============================================
  async remove(id: string) {
    const evaluacion = await this.findOne(id);

    if (evaluacion.status === 'cerrada') {
      throw new BadRequestException(
        'No se puede eliminar una evaluación cerrada',
      );
    }

    await this.prisma.evaluacion.delete({
      where: { id },
    });

    return { message: 'Evaluación eliminada exitosamente' };
  }
}
