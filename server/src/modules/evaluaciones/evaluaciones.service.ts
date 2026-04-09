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
  // Llamado por el cron automático — filtra KPIs por periodicidad
  async cerrarPeriodoAuto(
    periodicidad: string,
    periodo: string,
    anio: number,
  ) {
    const dto: CerrarPeriodoDto = { periodo, anio };
    return this.cerrarPeriodo(dto, 'SISTEMA', periodicidad);
  }

  async cerrarPeriodo(
    cerrarDto: CerrarPeriodoDto,
    evaluadorId: string,
    periodicidadFiltro?: string,
  ) {
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

        // Calcular detalles por KPI
        const todosLosKpis = this.agruparOrdenesPorKpi(ordenes);

        // Si hay filtro de periodicidad, solo procesar KPIs que correspondan
        const detallesPorKpi = periodicidadFiltro
          ? Object.fromEntries(
              Object.entries(todosLosKpis).filter(
                ([, ords]) => ords[0].kpi?.periodicidad === periodicidadFiltro,
              ),
            )
          : todosLosKpis;

        if (Object.keys(detallesPorKpi).length === 0) {
          console.log(
            `⏭️  ${empleado.nombre} ${empleado.apellido} no tiene KPIs de periodicidad "${periodicidadFiltro}" en este periodo`,
          );
          continue;
        }

        // Crear evaluación (solo si hay KPIs que procesar)
        const evaluacion = await this.prisma.evaluacion.create({
          data: {
            empleadoId: empleado.id,
            evaluadorId,
            periodo: cerrarDto.periodo,
            anio: cerrarDto.anio,
            calculadaAutomaticamente: true,
            status: 'borrador',
          },
        });

        const detallesCreados: any[] = [];

        for (const [kpiId, ordenesKpi] of Object.entries(detallesPorKpi)) {
          const kpi = ordenesKpi[0].kpi;

          // Para division+OT el denominador debe ser todas las órdenes no-canceladas del período
          let totalNoCanceladas: number | undefined;
          if (kpi.tipoCalculo === 'division' && kpi.aplicaOrdenTrabajo) {
            totalNoCanceladas = await this.prisma.ordenTrabajo.count({
              where: {
                kpiId,
                empleadoId: empleado.id,
                status: { not: 'cancelada' },
                fechaCompletada: { gte: fechaInicio, lte: fechaFin },
              },
            });
          }

          // Preparar valores para cálculo
          const valores = await this.extraerValoresParaCalculo(
            ordenesKpi,
            kpi,
            totalNoCanceladas,
            {
              empleadoId: empleado.id,
              areaId: empleado.areaId,
              periodo: cerrarDto.periodo,
              anio: cerrarDto.anio,
            },
          );

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
      if (!orden.kpiId) continue; // saltar órdenes personalizadas (sin KPI)
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
  private async extraerValoresParaCalculo(
    ordenes: any[],
    kpi: any,
    totalNoCanceladas?: number,
    context?: { empleadoId: string; areaId: string | null; periodo: string; anio: number },
  ): Promise<Record<string, any>> {
    const valores: Record<string, any> = {};

    // Según el tipo de cálculo, extraer valores
    switch (kpi.tipoCalculo) {
      case 'binario':
        // 1 si todas las órdenes están aprobadas, 0 si no
        valores['valor'] = ordenes.every((o) => o.status === 'aprobada') ? 1 : 0;
        break;

      case 'division':
        if (kpi.aplicaOrdenTrabajo) {
          // Numerador: órdenes aprobadas/completadas
          // Denominador: totalNoCanceladas (todas las completadas/no-canceladas del período)
          const aprobadas = ordenes.filter(
            (o) => o.status === 'aprobada' || o.status === 'completada',
          ).length;
          valores['numerador'] = aprobadas;
          valores['denominador'] = totalNoCanceladas ?? ordenes.length;
        } else {
          // Buscar en valoresCalculo de las órdenes
          const formula = JSON.parse(kpi.formulaCalculo);
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
        }
        break;

      case 'conteo':
        // El valor registrado en la orden (valorNumerico) es la cantidad real medida
        // Si hay múltiples órdenes, se suma el total
        valores['cantidad'] = ordenes.reduce((sum, o) => {
          const v = o.valoresCalculo ? JSON.parse(o.valoresCalculo) : {};
          return sum + (v.cantidad ?? 0);
        }, 0) || ordenes.length;
        break;

      case 'porcentaje_kpis_equipo': {
        // % de KPIs verdes del equipo del jefe en el mismo período
        if (!context?.areaId) {
          valores['kpisVerdes'] = 0;
          valores['totalKpis'] = 1;
          break;
        }
        const miembrosEquipo = await this.prisma.user.findMany({
          where: { areaId: context.areaId, id: { not: context.empleadoId }, activo: true },
          select: { id: true },
        });
        if (miembrosEquipo.length === 0) {
          valores['kpisVerdes'] = 0;
          valores['totalKpis'] = 1;
          break;
        }
        const miembroIds = miembrosEquipo.map((m: any) => m.id);
        const detallesEquipo = await this.prisma.evaluacionDetalle.findMany({
          where: {
            evaluacion: {
              empleadoId: { in: miembroIds },
              periodo: context.periodo,
              anio: context.anio,
            },
          },
          select: { estado: true },
        });
        valores['kpisVerdes'] = detallesEquipo.filter((d: any) => d.estado === 'verde').length;
        valores['totalKpis'] = detallesEquipo.length || 1;
        break;
      }

      case 'dashboard_presentado':
        // Verificar si todas las órdenes están aprobadas
        valores['presentado'] = ordenes.every((o) => o.status === 'aprobada');
        break;

      default:
        valores['resultado'] = ordenes.length;
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
