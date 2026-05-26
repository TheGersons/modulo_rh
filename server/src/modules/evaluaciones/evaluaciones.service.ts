import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CerrarPeriodoDto } from './dto/cerrar-periodo.dto';
import { KpisService } from '../kpis/kpis.service';

// User sintético usado como evaluadorId en cierres automáticos. La FK de
// Evaluacion.evaluadorId apunta a User, por lo que esta fila debe existir.
const SISTEMA_USER_ID = 'SISTEMA';

@Injectable()
export class EvaluacionesService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private kpisService: KpisService,
  ) {}

  async onModuleInit() {
    await this.prisma.user.upsert({
      where: { id: SISTEMA_USER_ID },
      update: {},
      create: {
        id: SISTEMA_USER_ID,
        email: 'sistema@interno.local',
        password: '!', // nunca se usa para login
        nombre: 'Sistema',
        apellido: 'Automático',
        role: 'sistema',
        activo: false,
      },
    });
  }

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

  // Permite al cron saltarse periodos ya cerrados sin tocar evidencias ni datos.
  async existeAlgunaEvaluacion(periodo: string, anio: number): Promise<boolean> {
    const c = await this.prisma.evaluacion.count({ where: { periodo, anio } });
    return c > 0;
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

    // Meses "YYYY-MM" que cubre este cierre — formato de EvidenciaKPI.periodo.
    // (cerrarDto.periodo es nombre de mes / trimestre / etc.)
    const periodosEvid = this.periodosEvidencia(
      cerrarDto.periodo,
      cerrarDto.anio,
    );

    console.log(
      `📅 Periodo: ${fechaInicio.toISOString()} - ${fechaFin.toISOString()}`,
    );

    // 2b. Auto-aprobar evidencias pendientes del período al cierre.
    //     Política: terminada la ventana de gracia, lo que el empleado subió y
    //     no fue revisado se acepta automáticamente para no penalizar al
    //     trabajador por la lentitud del revisor. Las rechazadas NO se tocan.
    const idsEmpleados = empleados.map((e) => e.id);
    const ahora = new Date();

    const autoKpi = await this.prisma.evidenciaKPI.updateMany({
      where: {
        empleadoId: { in: idsEmpleados },
        periodo: { in: periodosEvid },
        status: 'pendiente_revision',
        tipo: { not: 'nota_kpi' },
      },
      data: {
        status: 'aprobada',
        fechaRevision: ahora,
      },
    });
    if (autoKpi.count > 0) {
      console.log(
        `✅ Auto-aprobadas ${autoKpi.count} evidencias KPI pendientes (cierre ${cerrarDto.periodo})`,
      );
    }

    // Evidencias de tareas (órdenes de trabajo): la "fecha del período" de una
    // orden es su fechaLimite. Auto-aprobamos las pendientes cuyas órdenes
    // caen en este período.
    const autoOrden = await this.prisma.evidencia.updateMany({
      where: {
        status: 'pendiente_revision',
        tarea: {
          ordenTrabajo: {
            empleadoId: { in: idsEmpleados },
            fechaLimite: { gte: fechaInicio, lte: fechaFin },
          },
        },
      },
      data: { status: 'aprobada' },
    });
    if (autoOrden.count > 0) {
      console.log(
        `✅ Auto-aprobadas ${autoOrden.count} evidencias de órdenes pendientes (cierre ${cerrarDto.periodo})`,
      );
    }

    const evaluacionesCreadas: any[] = [];

    // porcentaje_kpis_equipo se difiere: el equipo puede no tener evaluaciones aún en la primera pasada
    const pendingEquipoCalcs: Array<{
      evaluacionId: string;
      kpiId: string;
      ordenesKpi: any[];
      kpi: any;
      context: { empleadoId: string; areaId: string | null; periodo: string; anio: number };
    }> = [];

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

        // KPIs ASIGNADOS al empleado (área + puesto) — fuente de verdad de qué se
        // le mide, no las órdenes. Filtrados por periodicidad si aplica.
        const kpisAsignadosRaw = await this.kpisService.getKpisPorEmpleado(
          empleado.id,
        );
        const kpisAsignados = periodicidadFiltro
          ? kpisAsignadosRaw.filter((k) => k.periodicidad === periodicidadFiltro)
          : kpisAsignadosRaw;

        if (kpisAsignados.length === 0) {
          console.log(
            `⏭️  ${empleado.nombre} ${empleado.apellido} no tiene KPIs de periodicidad "${periodicidadFiltro}"`,
          );
          continue;
        }

        // Órdenes completadas/aprobadas del empleado en el periodo (KPIs basados en OT)
        const ordenes = await this.prisma.ordenTrabajo.findMany({
          where: {
            empleadoId: empleado.id,
            status: { in: ['completada', 'aprobada'] },
            fechaCompletada: { gte: fechaInicio, lte: fechaFin },
          },
          include: { kpi: true, tareas: { include: { evidencias: true } } },
        });
        const ordenesPorKpi = this.agruparOrdenesPorKpi(ordenes);

        // Respaldos de gracia aprobados → justifican "no_aplica" en KPIs OT sin órdenes
        const respaldosAprobados = await this.prisma.evidenciaKPI.findMany({
          where: {
            empleadoId: empleado.id,
            periodo: { in: periodosEvid },
            esRespaldoGracia: true,
            status: 'aprobada',
          },
          select: { kpiId: true },
        });
        const kpisConGracia = new Set(respaldosAprobados.map((r) => r.kpiId));

        // Evidencias aprobadas con valor numérico subidas en el periodo (KPIs por
        // evidencia). Las pendientes ya fueron auto-aprobadas arriba; las rechazadas
        // no cuentan. EvidenciaKPI.periodo usa formato "YYYY-MM".
        const evidencias = await this.prisma.evidenciaKPI.findMany({
          where: {
            empleadoId: empleado.id,
            periodo: { in: periodosEvid },
            tipo: { not: 'nota_kpi' },
            esRespaldoGracia: false,
            status: 'aprobada',
            valorNumerico: { not: null },
          },
          orderBy: { fechaSubida: 'desc' },
          select: { kpiId: true, valorNumerico: true },
        });
        // Última (más reciente) evidencia con valor por KPI
        const valorPorKpi = new Map<string, number>();
        for (const e of evidencias) {
          if (!valorPorKpi.has(e.kpiId) && e.valorNumerico != null) {
            valorPorKpi.set(e.kpiId, e.valorNumerico);
          }
        }

        // Todos los empleados con ≥1 KPI asignado reciben evaluación.
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

        for (const kpi of kpisAsignados) {
          const kpiId = kpi.id;

          // Diferir a segunda pasada: el equipo puede no tener evaluaciones aún
          if (kpi.tipoCalculo === 'porcentaje_kpis_equipo') {
            pendingEquipoCalcs.push({
              evaluacionId: evaluacion.id,
              kpiId,
              ordenesKpi: ordenesPorKpi[kpiId] ?? [],
              kpi,
              context: {
                empleadoId: empleado.id,
                areaId: empleado.areaId,
                periodo: cerrarDto.periodo,
                anio: cerrarDto.anio,
              },
            });
            continue;
          }

          let resultadoNumerico = 0;
          let estado = 'rojo';
          let ordenTrabajoId: string | null = null;
          let formulaUtilizada: any = { tipoCalculo: kpi.tipoCalculo };

          if (kpi.aplicaOrdenTrabajo) {
            const ordenesKpi = ordenesPorKpi[kpiId] ?? [];
            if (ordenesKpi.length > 0) {
              let totalNoCanceladas: number | undefined;
              if (kpi.tipoCalculo === 'division') {
                totalNoCanceladas = await this.prisma.ordenTrabajo.count({
                  where: {
                    kpiId,
                    empleadoId: empleado.id,
                    status: { not: 'cancelada' },
                    fechaInicio: { gte: fechaInicio, lte: fechaFin },
                  },
                });
              }
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
              const rc = await this.kpisService.calcularResultado({
                kpiId,
                valores,
              });
              resultadoNumerico = rc.resultado ?? 0;
              estado = rc.estado ?? 'rojo';
              ordenTrabajoId = ordenesKpi[0].id;
              formulaUtilizada = { tipoCalculo: kpi.tipoCalculo, valores };
            } else if (kpisConGracia.has(kpiId)) {
              // Sin órdenes pero con respaldo de gracia aprobado → no aplica
              estado = 'no_aplica';
              formulaUtilizada = {
                tipoCalculo: kpi.tipoCalculo,
                motivo: 'sin_ordenes_respaldo_aprobado',
              };
            } else {
              // Sin órdenes ni respaldo → 0 / rojo
              estado = 'rojo';
              formulaUtilizada = {
                tipoCalculo: kpi.tipoCalculo,
                motivo: 'sin_ordenes',
              };
            }
          } else {
            // KPI evaluado por evidencia subida
            const valor = valorPorKpi.get(kpiId) ?? null;
            const ev = this.kpisService.evaluarKpiPorValor(kpi, valor);
            resultadoNumerico = ev.resultado;
            estado = ev.estado;
            formulaUtilizada = {
              tipoCalculo: kpi.tipoCalculo,
              valor,
              motivo: valor === null ? 'sin_evidencia' : undefined,
            };
          }

          // El promedio se calcula por cumplimiento: verde=100, amarillo=50, rojo=0.
          // no_aplica queda fuera del promedio (resultadoPorcentaje = null).
          const resultadoPorcentaje =
            estado === 'no_aplica'
              ? null
              : estado === 'verde'
                ? 100
                : estado === 'amarillo'
                  ? 50
                  : 0;

          const detalle = await this.prisma.evaluacionDetalle.create({
            data: {
              evaluacionId: evaluacion.id,
              kpiId,
              ordenTrabajoId,
              resultadoNumerico,
              resultadoPorcentaje,
              brechaVsMeta:
                kpi.meta != null ? resultadoNumerico - kpi.meta : null,
              estado,
              formulaUtilizada: JSON.stringify(formulaUtilizada),
              meta: kpi.meta,
              umbralAmarillo: kpi.umbralAmarillo,
            },
          });
          detallesCreados.push(detalle);
        }

        // Promedio y KPIs rojos (excluye porcentaje_kpis_equipo diferidos y no_aplica).
        const detallesValidos = detallesCreados.filter(
          (d) => d.estado !== 'no_aplica',
        );
        let promedioGeneral = 0;
        let kpisRojos = 0;
        if (detallesValidos.length > 0) {
          promedioGeneral =
            detallesValidos.reduce(
              (sum, d) => sum + (d.resultadoPorcentaje ?? 0),
              0,
            ) / detallesValidos.length;
          kpisRojos = detallesValidos.filter((d) => d.estado === 'rojo').length;
          const porcentajeRojos = (kpisRojos / detallesValidos.length) * 100;

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
        }

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

    // ============================================
    // SEGUNDA PASADA: porcentaje_kpis_equipo
    // Ahora todos los empleados ya tienen sus evaluaciones — los datos del equipo están listos.
    // ============================================
    for (const pending of pendingEquipoCalcs) {
      try {
        const valores = await this.extraerValoresParaCalculo(
          pending.ordenesKpi,
          pending.kpi,
          undefined,
          pending.context,
        );

        const resultadoCalculo = await this.kpisService.calcularResultado({
          kpiId: pending.kpiId,
          valores,
        });

        const resultadoFinal = resultadoCalculo.resultado ?? 0;
        const estadoEquipo = resultadoCalculo.estado ?? 'rojo';
        const kpi = pending.kpi;

        // Mismo criterio que la primera pasada: promedio por cumplimiento.
        const resultadoPorcentajeEquipo =
          estadoEquipo === 'verde'
            ? 100
            : estadoEquipo === 'amarillo'
              ? 50
              : 0;

        await this.prisma.evaluacionDetalle.create({
          data: {
            evaluacionId: pending.evaluacionId,
            kpiId: pending.kpiId,
            ordenTrabajoId: pending.ordenesKpi[0]?.id ?? null,
            resultadoNumerico: resultadoFinal,
            resultadoPorcentaje: resultadoPorcentajeEquipo,
            brechaVsMeta: kpi.meta != null ? resultadoFinal - kpi.meta : null,
            estado: estadoEquipo,
            formulaUtilizada: JSON.stringify({ tipoCalculo: kpi.tipoCalculo, valores }),
            meta: kpi.meta,
            umbralAmarillo: kpi.umbralAmarillo,
          },
        });

        // Recalcular promedio con TODOS los detalles ya existentes en BD
        // (excluyendo "no_aplica" que no entran al promedio).
        const allDetalles = await this.prisma.evaluacionDetalle.findMany({
          where: { evaluacionId: pending.evaluacionId },
          select: { resultadoPorcentaje: true, estado: true },
        });

        const validos = allDetalles.filter((d) => d.estado !== 'no_aplica');
        const promedioFinal =
          validos.length > 0
            ? validos.reduce((s, d) => s + (d.resultadoPorcentaje ?? 0), 0) / validos.length
            : 0;
        const kpisRojosFinal = validos.filter((d) => d.estado === 'rojo').length;
        const porcentajeRojosFinal =
          validos.length > 0 ? (kpisRojosFinal / validos.length) * 100 : 0;

        await this.prisma.evaluacion.update({
          where: { id: pending.evaluacionId },
          data: {
            promedioGeneral: promedioFinal,
            kpisRojos: kpisRojosFinal,
            porcentajeRojos: porcentajeRojosFinal,
            status: 'calculada',
            fechaCalculo: new Date(),
          },
        });
      } catch (error) {
        console.error(
          `❌ Error en segunda pasada (porcentaje_kpis_equipo) evaluacion ${pending.evaluacionId}:`,
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
  // PERIODOS DE EVIDENCIA QUE CUBRE EL CIERRE
  // ============================================
  // EvidenciaKPI.periodo se guarda como "YYYY-MM". Un cierre mensual cubre 1 mes;
  // uno trimestral/semestral/anual cubre los meses del rango.
  private periodosEvidencia(periodo: string, anio: number): string[] {
    const MESES = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];
    const ym = (m0: number) => `${anio}-${String(m0 + 1).padStart(2, '0')}`;

    const idxMes = MESES.indexOf(periodo);
    if (idxMes >= 0) return [ym(idxMes)];

    const tri = /^trimestre_([1-4])$/.exec(periodo);
    if (tri) {
      const start = (parseInt(tri[1], 10) - 1) * 3;
      return [ym(start), ym(start + 1), ym(start + 2)];
    }

    const sem = /^semestre_([12])$/.exec(periodo);
    if (sem) {
      const start = sem[1] === '1' ? 0 : 6;
      return Array.from({ length: 6 }, (_, i) => ym(start + i));
    }

    if (periodo === 'anual') {
      return Array.from({ length: 12 }, (_, i) => ym(i));
    }

    return [];
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

      case 'acumulado_trimestral': {
        // Acumula el valor desde inicio del año hasta el fin del trimestre actual.
        // Variante A: formula = { campo, metas: { Q1, Q2, Q3, Q4 } }
        // Variante B: formula = { campo, metaAnual, porcentajes: { Q1, Q2, Q3, Q4 } }
        const formula = JSON.parse(kpi.formulaCalculo);
        const campo = formula.campo ?? 'valor';

        // Determinar número de trimestre a partir del periodo ("trimestre_2" → 2)
        const trimestreMatch = context?.periodo?.match(/trimestre_(\d)/);
        const trimestreNum = trimestreMatch ? parseInt(trimestreMatch[1]) : 4;
        const qKey = `Q${trimestreNum}`;

        // Rango acumulado: 1-Ene del año hasta el último día del trimestre actual
        const mesFinTrimestre = trimestreNum * 3;
        const fechaInicioAnio = new Date(context?.anio ?? new Date().getFullYear(), 0, 1);
        const fechaFinTrimestre = new Date(
          context?.anio ?? new Date().getFullYear(),
          mesFinTrimestre,
          0, 23, 59, 59,
        );

        const ordenesAcumuladas = await this.prisma.ordenTrabajo.findMany({
          where: {
            kpiId: kpi.id,
            empleadoId: context?.empleadoId,
            status: { in: ['completada', 'aprobada'] },
            fechaCompletada: { gte: fechaInicioAnio, lte: fechaFinTrimestre },
          },
          select: { valoresCalculo: true },
        });

        const valorAcumulado = ordenesAcumuladas.reduce((sum, o) => {
          if (!o.valoresCalculo) return sum;
          try {
            const v = JSON.parse(o.valoresCalculo);
            return sum + (Number(v[campo]) || 0);
          } catch {
            return sum;
          }
        }, 0);

        // Meta del trimestre según variante
        let metaTrimestre: number;
        if (formula.metas) {
          // Variante A: metas absolutas por trimestre
          metaTrimestre = Number(formula.metas[qKey] ?? formula.metas['Q4'] ?? 1);
        } else if (formula.metaAnual != null && formula.porcentajes) {
          // Variante B: meta anual × porcentaje acumulado del trimestre
          const pct = Number(formula.porcentajes[qKey] ?? 1);
          metaTrimestre = formula.metaAnual * pct;
        } else {
          metaTrimestre = 1;
        }

        valores['valorAcumulado'] = valorAcumulado;
        valores['metaTrimestre'] = metaTrimestre;
        break;
      }

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
