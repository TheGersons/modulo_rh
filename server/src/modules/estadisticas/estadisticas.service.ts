import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class EstadisticasService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // DASHBOARD GLOBAL
  // ============================================
  async getDashboardGlobal() {
    const [
      totalEmpleados,
      totalAreas,
      totalKpis,
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

      // Áreas
      this.prisma.area.count({ where: { activa: true } }),

      // KPIs
      this.prisma.kPI.count({ where: { activo: true } }),

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
      },
      kpis: {
        total: totalKpis,
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
        puesto: empleado.puesto,
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
        puesto: true,
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
        puesto: emp.puesto,
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
}
