import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { ConfiguracionService } from '../../common/configuracion/configuracion.service';
import {
  enVentanaGracia,
  formatPeriodo,
} from '../../common/utils/grace-period.util';

@Injectable()
export class EstadisticasService {
  constructor(
    private prisma: PrismaService,
    private configuracion: ConfiguracionService,
  ) {}

  // Resuelve el período activo respetando la ventana de gracia:
  // si hoy estamos en los días 1..N del mes siguiente al cierre,
  // el período activo sigue siendo el mes anterior.
  private async getPeriodoActivo(now: Date = new Date()): Promise<string> {
    const diasGracia = await this.configuracion.getDiasGracia();
    const periodoActual = formatPeriodo(now);
    // mes anterior
    const mesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const periodoAnterior = formatPeriodo(mesAnterior);
    return enVentanaGracia(now, periodoAnterior, diasGracia)
      ? periodoAnterior
      : periodoActual;
  }

  // Helper compartido: dado un set de áreas y un período, devuelve para cada
  // (empleadoId, kpiId) el estado efectivo en ese período.
  // Estado efectivo: aprobada > pendiente_revision > rechazada.
  // Las órdenes completadas/aprobadas del período rellenan KPIs faltantes
  // como 'aprobada' (para KPIs con aplicaOrdenTrabajo).
  private async getEstadoEvidenciasPorEmpleado(
    empleadoIds: string[],
    periodo: string,
  ): Promise<Map<string, Map<string, string>>> {
    const evidencias = await this.prisma.evidenciaKPI.findMany({
      where: {
        empleadoId: { in: empleadoIds },
        periodo,
        tipo: { not: 'nota_kpi' },
      },
      select: { empleadoId: true, kpiId: true, status: true },
    });

    const kpiStatusPorEmpleado = new Map<string, Map<string, string>>();
    for (const ev of evidencias) {
      if (!kpiStatusPorEmpleado.has(ev.empleadoId)) {
        kpiStatusPorEmpleado.set(ev.empleadoId, new Map());
      }
      const kpiMap = kpiStatusPorEmpleado.get(ev.empleadoId)!;
      const actual = kpiMap.get(ev.kpiId);
      if (
        !actual ||
        ev.status === 'aprobada' ||
        (ev.status === 'pendiente_revision' && actual !== 'aprobada')
      ) {
        kpiMap.set(ev.kpiId, ev.status);
      }
    }

    const [pYear, pMonth] = periodo.split('-').map(Number);
    const periodoStart = new Date(pYear, pMonth - 1, 1);
    const periodoEnd = new Date(pYear, pMonth, 1);

    const ordenesAprobadas = await this.prisma.ordenTrabajo.findMany({
      where: {
        empleadoId: { in: empleadoIds },
        kpiId: { not: null },
        status: { in: ['completada', 'aprobada'] },
        fechaLimite: { gte: periodoStart, lt: periodoEnd },
      },
      select: { empleadoId: true, kpiId: true },
    });

    for (const o of ordenesAprobadas) {
      if (!o.kpiId) continue;
      if (!kpiStatusPorEmpleado.has(o.empleadoId)) {
        kpiStatusPorEmpleado.set(o.empleadoId, new Map());
      }
      const kpiMap = kpiStatusPorEmpleado.get(o.empleadoId)!;
      if (!kpiMap.has(o.kpiId)) kpiMap.set(o.kpiId, 'aprobada');
    }

    return kpiStatusPorEmpleado;
  }

  // ============================================
  // DASHBOARD GLOBAL
  // ============================================
  async getDashboardGlobal() {
    const [
      totalEmpleados,
      totalAreas,
      areasPrincipales,
      subAreas,
      totalKpis,
      totalPuestos,
      totalOrdenes,
      ordenesActivas,
      ordenesCompletadas,
      ordenesVencidas,
      alertasActivas,
      evaluacionesRecientes,
      kpisCriticos,
    ] = await Promise.all([
      // Empleados
      this.prisma.user.count({ where: { activo: true } }),

      // Áreas totales
      this.prisma.area.count({ where: { activa: true } }),

      // Áreas principales (sin padre)
      this.prisma.area.count({ where: { activa: true, areaPadreId: null } }),

      // Sub-áreas (con padre)
      this.prisma.area.count({
        where: { activa: true, areaPadreId: { not: null } },
      }),

      // KPIs
      this.prisma.kPI.count({ where: { activo: true } }),

      // Puestos
      this.prisma.puesto.count({ where: { activo: true } }),

      // Órdenes totales
      this.prisma.ordenTrabajo.count(),

      // Órdenes activas
      this.prisma.ordenTrabajo.count({
        where: { status: { in: ['pendiente', 'en_proceso'] } },
      }),

      // Órdenes completadas
      this.prisma.ordenTrabajo.count({
        where: { status: { in: ['completada', 'aprobada'] } },
      }),

      // Órdenes vencidas
      this.prisma.ordenTrabajo.count({
        where: {
          status: { in: ['pendiente', 'en_proceso'] },
          fechaLimite: { lt: new Date() },
        },
      }),

      // Alertas activas
      this.prisma.alerta.count({
        where: { status: 'activa' },
      }),

      // Evaluaciones recientes (último mes)
      this.prisma.evaluacion.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        },
      }),

      // KPIs críticos con órdenes vencidas
      this.prisma.ordenTrabajo.count({
        where: {
          status: 'vencida',
          kpi: { tipoCriticidad: 'critico' },
        },
      }),
    ]);

    // Porcentajes
    const porcentajeCompletadas =
      totalOrdenes > 0 ? (ordenesCompletadas / totalOrdenes) * 100 : 0;

    const porcentajeVencidas =
      totalOrdenes > 0 ? (ordenesVencidas / totalOrdenes) * 100 : 0;

    return {
      empleados: {
        total: totalEmpleados,
      },
      areas: {
        total: totalAreas,
        principales: areasPrincipales,
        subAreas: subAreas,
      },
      kpis: {
        total: totalKpis,
      },
      puestos: {
        total: totalPuestos,
      },
      ordenes: {
        total: totalOrdenes,
        activas: ordenesActivas,
        completadas: ordenesCompletadas,
        vencidas: ordenesVencidas,
        porcentajeCompletadas: Math.round(porcentajeCompletadas * 100) / 100,
        porcentajeVencidas: Math.round(porcentajeVencidas * 100) / 100,
      },
      alertas: {
        activas: alertasActivas,
      },
      evaluaciones: {
        recientes: evaluacionesRecientes,
      },
      indicadores: {
        kpisCriticosVencidos: kpisCriticos,
      },
    };
  }

  // ============================================
  // ESTADÍSTICAS POR ÁREA
  // ============================================
  async getEstadisticasArea(areaId: string) {
    const area = await this.prisma.area.findUnique({
      where: { id: areaId },
      include: {
        jefe: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    if (!area) {
      throw new Error('Área no encontrada');
    }

    const [
      totalEmpleados,
      totalKpis,
      totalOrdenes,
      ordenesActivas,
      ordenesCompletadas,
      ordenesVencidas,
      alertasActivas,
      evaluacionesRecientes,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { areaId, activo: true },
      }),

      this.prisma.kPI.count({
        where: { areaId, activo: true },
      }),

      this.prisma.ordenTrabajo.count({
        where: {
          empleado: { areaId },
        },
      }),

      this.prisma.ordenTrabajo.count({
        where: {
          empleado: { areaId },
          status: { in: ['pendiente', 'en_proceso'] },
        },
      }),

      this.prisma.ordenTrabajo.count({
        where: {
          empleado: { areaId },
          status: { in: ['completada', 'aprobada'] },
        },
      }),

      this.prisma.ordenTrabajo.count({
        where: {
          empleado: { areaId },
          status: { in: ['pendiente', 'en_proceso'] },
          fechaLimite: { lt: new Date() },
        },
      }),

      this.prisma.alerta.count({
        where: { areaId, status: 'activa' },
      }),

      this.prisma.evaluacion.count({
        where: {
          empleado: { areaId },
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        },
      }),
    ]);

    // Ranking de empleados por desempeño
    const empleadosRanking = await this.prisma.user.findMany({
      where: { areaId, activo: true },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        evaluacionesRecibidas: {
          where: { status: 'cerrada' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            promedioGeneral: true,
          },
        },
      },
    });

    const ranking = empleadosRanking
      .map((emp) => ({
        empleado: `${emp.nombre} ${emp.apellido}`,
        promedio: emp.evaluacionesRecibidas[0]?.promedioGeneral || 0,
      }))
      .sort((a, b) => b.promedio - a.promedio);

    return {
      area: {
        id: area.id,
        nombre: area.nombre,
        jefe: area.jefe
          ? `${area.jefe.nombre} ${area.jefe.apellido}`
          : 'Sin asignar',
      },
      empleados: {
        total: totalEmpleados,
      },
      kpis: {
        total: totalKpis,
      },
      ordenes: {
        total: totalOrdenes,
        activas: ordenesActivas,
        completadas: ordenesCompletadas,
        vencidas: ordenesVencidas,
      },
      alertas: {
        activas: alertasActivas,
      },
      evaluaciones: {
        recientes: evaluacionesRecientes,
      },
      ranking: ranking.slice(0, 10),
    };
  }

  // ============================================
  // ESTADÍSTICAS POR EMPLEADO
  // ============================================
  async getEstadisticasEmpleado(empleadoId: string) {
    const empleado = await this.prisma.user.findUnique({
      where: { id: empleadoId },
      include: {
        area: {
          select: {
            nombre: true,
          },
        },
        puesto: {
          // ← AGREGAR
          select: {
            nombre: true,
          },
        },
      },
    });

    if (!empleado) {
      throw new Error('Empleado no encontrado');
    }

    const [
      totalOrdenes,
      ordenesActivas,
      ordenesCompletadas,
      ordenesVencidas,
      totalEvaluaciones,
      ultimaEvaluacion,
    ] = await Promise.all([
      this.prisma.ordenTrabajo.count({
        where: { empleadoId },
      }),

      this.prisma.ordenTrabajo.count({
        where: {
          empleadoId,
          status: { in: ['pendiente', 'en_proceso'] },
        },
      }),

      this.prisma.ordenTrabajo.count({
        where: {
          empleadoId,
          status: { in: ['completada', 'aprobada'] },
        },
      }),

      this.prisma.ordenTrabajo.count({
        where: {
          empleadoId,
          status: { in: ['pendiente', 'en_proceso'] },
          fechaLimite: { lt: new Date() },
        },
      }),

      this.prisma.evaluacion.count({
        where: { empleadoId },
      }),

      this.prisma.evaluacion.findFirst({
        where: { empleadoId },
        orderBy: { createdAt: 'desc' },
        include: {
          detalles: true,
        },
      }),
    ]);

    // Tasa de cumplimiento
    const tasaCumplimiento =
      totalOrdenes > 0 ? (ordenesCompletadas / totalOrdenes) * 100 : 0;

    return {
      empleado: {
        id: empleado.id,
        nombre: `${empleado.nombre} ${empleado.apellido}`,
        puesto: empleado.puesto?.nombre || 'Sin asignar', // ← CORREGIDO
        area: empleado.area?.nombre || 'Sin área',
      },
      ordenes: {
        total: totalOrdenes,
        activas: ordenesActivas,
        completadas: ordenesCompletadas,
        vencidas: ordenesVencidas,
        tasaCumplimiento: Math.round(tasaCumplimiento * 100) / 100,
      },
      evaluaciones: {
        total: totalEvaluaciones,
        ultimoPromedio: ultimaEvaluacion?.promedioGeneral || 0,
        ultimosKpisRojos: ultimaEvaluacion?.kpisRojos || 0,
      },
    };
  }

  // ============================================
  // CARGA LABORAL (Top empleados con más órdenes)
  // ============================================
  async getCargaLaboral(areaId?: string) {
    const where: any = {
      activo: true,
    };

    if (areaId) {
      where.areaId = areaId;
    }

    const empleados = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        puesto: {
          // ← CORREGIDO: era string, ahora es relación
          select: {
            nombre: true,
          },
        },
        ordenesTrabajoRecibidas: {
          where: {
            status: { in: ['pendiente', 'en_proceso'] },
          },
        },
      },
    });

    const carga = empleados
      .map((emp) => ({
        empleadoId: emp.id,
        empleado: `${emp.nombre} ${emp.apellido}`,
        puesto: emp.puesto?.nombre || 'Sin asignar', // ← CORREGIDO
        ordenesActivas: emp.ordenesTrabajoRecibidas.length,
      }))
      .sort((a, b) => b.ordenesActivas - a.ordenesActivas);

    return {
      carga,
      promedioOrdenes:
        carga.length > 0
          ? carga.reduce((sum, e) => sum + e.ordenesActivas, 0) / carga.length
          : 0,
      maxOrdenes: carga[0]?.ordenesActivas || 0,
      minOrdenes: carga[carga.length - 1]?.ordenesActivas || 0,
    };
  }

  // ============================================
  // TENDENCIAS (Últimos 6 meses)
  // ============================================
  async getTendencias(areaId?: string) {
    const meses: Array<{ mes: string; fechaInicio: Date; fechaFin: Date }> = []; // ← AGREGAR TIPO
    const hoy = new Date();

    // Generar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      meses.push({
        mes: fecha.toLocaleString('es', { month: 'long', year: 'numeric' }),
        fechaInicio: new Date(fecha.getFullYear(), fecha.getMonth(), 1),
        fechaFin: new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0),
      });
    }

    const tendencias: Array<{
      mes: string;
      completadas: number;
      vencidas: number;
    }> = []; // ← AGREGAR TIPO

    for (const mes of meses) {
      const where: any = {
        fechaCompletada: {
          gte: mes.fechaInicio,
          lte: mes.fechaFin,
        },
      };

      if (areaId) {
        where.empleado = { areaId };
      }

      const [completadas, vencidas] = await Promise.all([
        this.prisma.ordenTrabajo.count({
          where: {
            ...where,
            status: { in: ['completada', 'aprobada'] },
          },
        }),

        this.prisma.ordenTrabajo.count({
          where: {
            fechaLimite: {
              gte: mes.fechaInicio,
              lte: mes.fechaFin,
            },
            status: 'vencida',
            ...(areaId ? { empleado: { areaId } } : {}),
          },
        }),
      ]);

      tendencias.push({
        mes: mes.mes,
        completadas,
        vencidas,
      });
    }

    return tendencias;
  }

  // ============================================
  // RESUMEN POR TIPO DE KPI
  // ============================================
  async getResumenPorTipoKpi() {
    const kpisPorTipo = await this.prisma.kPI.groupBy({
      by: ['tipoCalculo'],
      where: { activo: true },
      _count: true,
    });

    const kpisPorCriticidad = await this.prisma.kPI.groupBy({
      by: ['tipoCriticidad'],
      where: { activo: true },
      _count: true,
    });

    return {
      porTipo: kpisPorTipo.map((item) => ({
        tipo: item.tipoCalculo,
        cantidad: item._count,
      })),
      porCriticidad: kpisPorCriticidad.map((item) => ({
        criticidad: item.tipoCriticidad,
        cantidad: item._count,
      })),
    };
  }

  // ============================================
  // RANKING DE ÁREAS POR % DE CUMPLIMIENTO DEL PERÍODO
  // ============================================
  async getRankingAreas() {
    const periodoActivo = await this.getPeriodoActivo();

    const areasPrincipales = await this.prisma.area.findMany({
      where: {
        activa: true,
        areaPadreId: null,
      },
      include: {
        subAreas: {
          where: { activa: true },
          select: { id: true },
        },
        _count: { select: { empleados: true } },
      },
    });

    const ranking = await Promise.all(
      areasPrincipales.map(async (area) => {
        const areasIds = [area.id];
        if (area.subAreas && area.subAreas.length > 0) {
          areasIds.push(...area.subAreas.map((sub) => sub.id));
        }

        const { promedio, empleados, kpisRojos } =
          await this.calcularMetricasArea(areasIds, periodoActivo);

        return {
          id: area.id,
          nombre: area.nombre,
          promedio,
          empleados,
          kpisRojos,
          subAreasCount: area.subAreas?.length ?? 0,
        };
      }),
    );

    return {
      periodo: periodoActivo,
      ranking: ranking.sort((a, b) => b.promedio - a.promedio),
    };
  }

  // ============================================
  // RANKING DE SUB-ÁREAS DE UN ÁREA PADRE
  // ============================================
  async getRankingSubAreas(areaId: string) {
    const periodoActivo = await this.getPeriodoActivo();

    const subAreas = await this.prisma.area.findMany({
      where: { activa: true, areaPadreId: areaId },
      select: { id: true, nombre: true },
    });

    const ranking = await Promise.all(
      subAreas.map(async (sub) => {
        const { promedio, empleados, kpisRojos } =
          await this.calcularMetricasArea([sub.id], periodoActivo);
        return {
          id: sub.id,
          nombre: sub.nombre,
          promedio,
          empleados,
          kpisRojos,
          subAreasCount: 0,
        };
      }),
    );

    return ranking.sort((a, b) => b.promedio - a.promedio);
  }

  // Helper: métricas del período (% cumplimiento + empleados + kpisRojos anuales)
  // % cumplimiento = (KPIs con evidencia aprobada o pendiente_revision en el período)
  //                  / (suma de KPIs activos por puesto de los empleados activos)
  private async calcularMetricasArea(areasIds: string[], periodo: string) {
    const empleadosArea = await this.prisma.user.findMany({
      where: { areaId: { in: areasIds }, activo: true },
      select: { id: true, puestoId: true },
    });
    const totalEmpleados = empleadosArea.length;

    let pct = 0;
    if (totalEmpleados > 0) {
      const empleadoIds = empleadosArea.map((e) => e.id);
      const puestoIds = empleadosArea
        .map((e) => e.puestoId)
        .filter(Boolean) as string[];

      // KPIs activos por puesto
      const kpisPorPuesto = await this.prisma.kPI.groupBy({
        by: ['puestoId'],
        where: { puestoId: { in: puestoIds }, activo: true },
        _count: { id: true },
      });
      const kpisCountMap = new Map(
        kpisPorPuesto.map((k) => [k.puestoId, k._count.id]),
      );

      // Total esperado = suma de KPIs activos del puesto de cada empleado
      let totalEsperado = 0;
      for (const emp of empleadosArea) {
        totalEsperado += kpisCountMap.get(emp.puestoId ?? '') ?? 0;
      }

      // Cumplidos = (empleado, kpi) con estado aprobada o pendiente_revision
      const estadoMap = await this.getEstadoEvidenciasPorEmpleado(
        empleadoIds,
        periodo,
      );
      let cumplidos = 0;
      for (const kpiMap of estadoMap.values()) {
        for (const status of kpiMap.values()) {
          if (status === 'aprobada' || status === 'pendiente_revision') {
            cumplidos++;
          }
        }
      }

      pct = totalEsperado > 0 ? (cumplidos / totalEsperado) * 100 : 0;
    }

    // kpisRojos: se conserva como agregado anual de evaluaciones cerradas
    const evaluaciones = await this.prisma.evaluacion.findMany({
      where: {
        empleado: { areaId: { in: areasIds } },
        anio: new Date().getFullYear(),
        status: 'cerrada',
      },
      select: { kpisRojos: true },
    });
    const totalKpisRojos = evaluaciones.reduce<number>(
      (acc, ev) => acc + ev.kpisRojos,
      0,
    );

    return {
      promedio: Math.round(pct * 100) / 100,
      empleados: totalEmpleados,
      kpisRojos: totalKpisRojos,
    };
  }

  // ============================================
  // EMPLEADOS DE UN ÁREA CON % CUMPLIMIENTO DEL PERÍODO
  // ============================================
  async getEmpleadosDeArea(areaId: string, periodo: string) {
    const empleados = await this.prisma.user.findMany({
      where: { areaId, activo: true },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        role: true,
        puesto: { select: { id: true, nombre: true } },
      },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });

    if (empleados.length === 0) return [];

    const empleadoIds = empleados.map((e) => e.id);
    const puestoIds = empleados
      .map((e) => e.puesto?.id)
      .filter(Boolean) as string[];

    // KPIs por puesto
    const kpisPorPuesto = await this.prisma.kPI.groupBy({
      by: ['puestoId'],
      where: { puestoId: { in: puestoIds }, activo: true },
      _count: { id: true },
    });
    const kpisCountMap = new Map(
      kpisPorPuesto.map((k) => [k.puestoId, k._count.id]),
    );

    // Estado efectivo por (empleado, kpi) en el período
    const kpiStatusPorEmpleado = await this.getEstadoEvidenciasPorEmpleado(
      empleadoIds,
      periodo,
    );

    // Alertas activas + órdenes vencidas (para flags visuales)
    const alertas = await this.prisma.alerta.groupBy({
      by: ['empleadoId'],
      where: { empleadoId: { in: empleadoIds }, status: 'activa' },
      _count: { id: true },
    });
    const alertasMap = new Map(
      alertas.map((a) => [a.empleadoId, a._count.id]),
    );

    const ahora = new Date();
    const ordenesActivas = await this.prisma.ordenTrabajo.findMany({
      where: {
        empleadoId: { in: empleadoIds },
        status: { in: ['pendiente', 'en_proceso'] },
      },
      select: { empleadoId: true, fechaLimite: true },
    });
    const vencidasMap = new Map<string, number>();
    for (const o of ordenesActivas) {
      if (new Date(o.fechaLimite) < ahora) {
        vencidasMap.set(
          o.empleadoId,
          (vencidasMap.get(o.empleadoId) ?? 0) + 1,
        );
      }
    }

    return empleados.map((emp) => {
      const kpiMap =
        kpiStatusPorEmpleado.get(emp.id) ?? new Map<string, string>();
      const statuses = [...kpiMap.values()];
      const cumplidos = statuses.filter(
        (s) => s === 'aprobada' || s === 'pendiente_revision',
      ).length;
      const totalKpis = kpisCountMap.get(emp.puesto?.id ?? '') ?? 0;
      const porcentajeCumplimiento =
        totalKpis > 0 ? Math.round((cumplidos / totalKpis) * 100) : 0;

      return {
        id: emp.id,
        nombre: emp.nombre,
        apellido: emp.apellido,
        role: emp.role,
        puesto: emp.puesto,
        porcentajeCumplimiento,
        kpisAprobados: cumplidos,
        kpisTotal: totalKpis,
        alertasActivas: alertasMap.get(emp.id) ?? 0,
        ordenesVencidas: vencidasMap.get(emp.id) ?? 0,
      };
    });
  }
}
