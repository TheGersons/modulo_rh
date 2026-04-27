import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class MiEquipoService {
  constructor(private prisma: PrismaService) {}

  async getMiEquipo(userId: string, periodo: string) {
    // 1. Verificar que el usuario es jefe y obtener su área
    const jefe = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, areaId: true },
    });

    if (!jefe || !['jefe', 'rrhh', 'administrador'].includes(jefe.role)) {
      throw new ForbiddenException('No tienes acceso a esta sección');
    }

    // 2. Construir set de áreas bajo su responsabilidad
    //    - rrhh y administrador → todas las áreas
    //    - jefe → su área + sub-áreas de su área
    const areaIds = new Set<string>();

    if (jefe.role === 'rrhh' || jefe.role === 'administrador') {
      const todasAreas = await this.prisma.area.findMany({
        select: { id: true },
      });
      todasAreas.forEach((a) => areaIds.add(a.id));
    } else {
      // jefe: usar su areaId del perfil
      if (!jefe.areaId) {
        return {
          areas: [],
          empleados: [],
          resumen: {
            total: 0,
            conKpisRojos: 0,
            conOrdenesVencidas: 0,
            conAlertas: 0,
            conEvidenciasPendientes: 0,
          },
          periodo,
        };
      }

      const areaJefe = await this.prisma.area.findUnique({
        where: { id: jefe.areaId },
        select: { areaPadreId: true },
      });

      if (!areaJefe?.areaPadreId) {
        // Es área padre → solo incluir sus sub-áreas, NO el área padre
        const subAreas = await this.prisma.area.findMany({
          where: { areaPadreId: jefe.areaId },
          select: { id: true },
        });
        subAreas.forEach((sa) => areaIds.add(sa.id));
      } else {
        // Es sub-área → solo su propia sub-área
        areaIds.add(jefe.areaId);
      }
    }
    // 3. Obtener empleados activos de esas áreas (excluir al propio jefe)
    const empleados = await this.prisma.user.findMany({
      where: {
        areaId: { in: Array.from(areaIds) },
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        role: true,
        areaId: true,
        area: { select: { id: true, nombre: true } },
        puesto: { select: { id: true, nombre: true } },
        alertas: {
          where: { status: 'activa' },
          select: {
            id: true,
            tipo: true,
            nivel: true,
            titulo: true,
            fechaDeteccion: true,
          },
          orderBy: { fechaDeteccion: 'desc' },
          take: 5,
        },
        ordenesTrabajoRecibidas: {
          where: { status: { in: ['pendiente', 'en_proceso'] } },
          select: {
            id: true,
            titulo: true,
            status: true,
            fechaLimite: true,
            progreso: true,
            kpi: { select: { indicador: true, key: true } },
          },
          orderBy: { fechaLimite: 'asc' },
        },
      },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });

    if (empleados.length === 0) {
      return {
        areas: [],
        empleados: [],
        resumen: {
          total: 0,
          conKpisRojos: 0,
          conOrdenesVencidas: 0,
          conAlertas: 0,
          conEvidenciasPendientes: 0,
        },
        periodo,
      };
    }

    // 4. Evidencias KPI del período — estado efectivo por KPI (último intento gana)
    //    Contamos KPIs distintos, no intentos, para evitar inflación del porcentaje.
    const empleadoIds = empleados.map((e) => e.id);

    const todasEvidencias = await this.prisma.evidenciaKPI.findMany({
      where: {
        empleadoId: { in: empleadoIds },
        periodo,
        tipo: { not: 'nota_kpi' },
      },
      select: { empleadoId: true, kpiId: true, status: true },
    });

    // Para cada (empleadoId, kpiId) determinar estado efectivo:
    // aprobada > pendiente_revision > rechazada
    const kpiStatusPorEmpleado = new Map<string, Map<string, string>>();
    for (const ev of todasEvidencias) {
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

    // Órdenes completadas/aprobadas del período → cuentan como 'aprobada' para su KPI
    // (para KPIs con aplicaOrdenTrabajo=true cuya evidencia va por el flujo de órdenes)
    const [pYear, pMonth] = periodo.split('-').map(Number);
    const periodoStart = new Date(pYear, pMonth - 1, 1);
    const periodoEnd   = new Date(pYear, pMonth, 1);

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
      // La EvidenciaKPI tiene prioridad; la orden solo rellena lo que falta
      if (!kpiMap.has(o.kpiId)) {
        kpiMap.set(o.kpiId, 'aprobada');
      }
    }

    // 5. Evidencias pendientes de revisión con detalle (para mostrar al jefe)
    const evidenciasPendientes = await this.prisma.evidenciaKPI.findMany({
      where: {
        empleadoId: { in: empleadoIds },
        status: 'pendiente_revision',
        periodo,
      },
      select: {
        id: true,
        empleadoId: true,
        archivoUrl: true,
        nombre: true,
        fechaSubida: true,
        esFueraDeTiempo: true,
        kpi: { select: { id: true, indicador: true, key: true } },
      },
      orderBy: { fechaSubida: 'asc' },
    });

    // Agrupar evidencias pendientes por empleado
    const evidenciasPendientesPorEmpleado = new Map<
      string,
      typeof evidenciasPendientes
    >();
    for (const ev of evidenciasPendientes) {
      if (!evidenciasPendientesPorEmpleado.has(ev.empleadoId)) {
        evidenciasPendientesPorEmpleado.set(ev.empleadoId, []);
      }
      evidenciasPendientesPorEmpleado.get(ev.empleadoId)!.push(ev);
    }

    // 6. KPIs totales por puesto
    const puestoIds = empleados
      .map((e) => e.puesto?.id)
      .filter(Boolean) as string[];

    const kpisPorPuesto = await this.prisma.kPI.groupBy({
      by: ['puestoId'],
      where: { puestoId: { in: puestoIds }, activo: true },
      _count: { id: true },
    });

    const kpisCountMap = new Map(
      kpisPorPuesto.map((k) => [k.puestoId, k._count.id]),
    );

    // 7. Construir datos por empleado
    const empleadosConData = empleados.map((emp) => {
      const kpiMap = kpiStatusPorEmpleado.get(emp.id) ?? new Map<string, string>();
      const statuses = [...kpiMap.values()];
      const aprobadas = statuses.filter((s) => s === 'aprobada').length;
      const enRevision = statuses.filter((s) => s === 'pendiente_revision').length;
      const rechazadas = statuses.filter((s) => s === 'rechazada').length;
      const totalKpis = kpisCountMap.get(emp.puesto?.id ?? '') ?? 0;

      const ordenesVencidas = emp.ordenesTrabajoRecibidas.filter(
        (o) => new Date(o.fechaLimite) < new Date(),
      );

      const evidenciasParaRevisar =
        evidenciasPendientesPorEmpleado.get(emp.id) ?? [];

      return {
        id: emp.id,
        nombre: emp.nombre,
        apellido: emp.apellido,
        role: emp.role,
        area: emp.area,
        puesto: emp.puesto,
        kpis: {
          total: totalKpis,
          aprobados: aprobadas,
          enRevision,
          rechazados: rechazadas,
          pendientes: Math.max(
            0,
            totalKpis - aprobadas - enRevision - rechazadas,
          ),
          porcentajeCumplimiento:
            totalKpis > 0 ? Math.round((aprobadas / totalKpis) * 100) : 0,
        },
        ordenes: {
          activas: emp.ordenesTrabajoRecibidas.length,
          vencidas: ordenesVencidas.length,
          detalle: emp.ordenesTrabajoRecibidas,
        },
        alertas: emp.alertas,
        evidenciasPendientes: evidenciasParaRevisar,
        tieneProblemas:
          rechazadas > 0 ||
          ordenesVencidas.length > 0 ||
          emp.alertas.length > 0,
        tieneEvidenciasParaRevisar: evidenciasParaRevisar.length > 0,
      };
    });

    // 8. Resumen general
    const resumen = {
      total: empleadosConData.length,
      conKpisRojos: empleadosConData.filter((e) => e.kpis.rechazados > 0)
        .length,
      conOrdenesVencidas: empleadosConData.filter((e) => e.ordenes.vencidas > 0)
        .length,
      conAlertas: empleadosConData.filter((e) => e.alertas.length > 0).length,
      conEvidenciasPendientes: empleadosConData.filter(
        (e) => e.tieneEvidenciasParaRevisar,
      ).length,
    };

    // 9. Info de áreas
    const areasInfo = await this.prisma.area.findMany({
      where: { id: { in: Array.from(areaIds) } },
      select: {
        id: true,
        nombre: true,
        areaPadreId: true,
        _count: { select: { empleados: { where: { activo: true } } } },
      },
    });

    return {
      areas: areasInfo,
      empleados: empleadosConData,
      resumen,
      periodo,
    };
  }

  // ─── AGREGAR en mi-equipo.service.ts ─────────────────────────────────────────
  // Estos dos métodos van dentro de la clase MiEquipoService

  // ============================================
  // DETALLE KPIs DE UN EMPLEADO
  // ============================================
  async getEmpleadoKpis(empleadoId: string, periodo: string) {
    const empleado = await this.prisma.user.findUnique({
      where: { id: empleadoId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        puesto: { select: { id: true, nombre: true } },
        area: { select: { id: true, nombre: true } },
      },
    });

    if (!empleado) return null;

    // KPIs del puesto
    const kpis = await this.prisma.kPI.findMany({
      where: {
        puestoId: empleado.puesto?.id,
        activo: true,
      },
      select: {
        id: true,
        key: true,
        indicador: true,
        descripcion: true,
        tipoCalculo: true,
        meta: true,
        operadorMeta: true,
        unidad: true,
        tipoCriticidad: true,
        periodicidad: true,
        sentido: true,
      },
      orderBy: { indicador: 'asc' },
    });

    // Evidencias del período para este empleado
    const evidencias = await this.prisma.evidenciaKPI.findMany({
      where: {
        empleadoId,
        periodo,
        kpiId: { in: kpis.map((k) => k.id) },
      },
      select: {
        id: true,
        kpiId: true,
        status: true,
        valorNumerico: true,
        esFueraDeTiempo: true,
        fechaSubida: true,
        motivoRechazo: true,
        intento: true,
        archivoUrl: true,
        nombre: true,
      },
      orderBy: { fechaSubida: 'desc' },
    });

    // Agrupar evidencias por KPI — tomar la más reciente por KPI
    const evidenciasPorKpi = new Map<string, (typeof evidencias)[0]>();
    for (const ev of evidencias) {
      if (!evidenciasPorKpi.has(ev.kpiId)) {
        evidenciasPorKpi.set(ev.kpiId, ev);
      }
    }

    // Órdenes completadas/aprobadas del período para KPIs con aplicaOrdenTrabajo
    const [pYear, pMonth] = periodo.split('-').map(Number);
    const periodoStart = new Date(pYear, pMonth - 1, 1);
    const periodoEnd   = new Date(pYear, pMonth, 1);

    const ordenesDelPeriodo = await this.prisma.ordenTrabajo.findMany({
      where: {
        empleadoId,
        kpiId: { in: kpis.map((k) => k.id) },
        status: { in: ['completada', 'aprobada'] },
        fechaLimite: { gte: periodoStart, lt: periodoEnd },
      },
      select: { kpiId: true },
    });

    const kpisCompletadosPorOrden = new Set(
      ordenesDelPeriodo.map((o) => o.kpiId).filter(Boolean) as string[],
    );

    // Construir detalle por KPI
    const kpisDetalle = kpis.map((kpi) => {
      const evidencia = evidenciasPorKpi.get(kpi.id);
      const todasEvidencias = evidencias.filter((e) => e.kpiId === kpi.id);

      let estadoKpi:
        | 'aprobado'
        | 'rechazado'
        | 'pendiente_revision'
        | 'pendiente' = 'pendiente';
      if (evidencia?.status === 'aprobada') estadoKpi = 'aprobado';
      else if (evidencia?.status === 'rechazada') estadoKpi = 'rechazado';
      else if (evidencia?.status === 'pendiente_revision')
        estadoKpi = 'pendiente_revision';
      else if (kpisCompletadosPorOrden.has(kpi.id)) estadoKpi = 'aprobado';

      return {
        ...kpi,
        estado: estadoKpi,
        valorObtenido: evidencia?.valorNumerico ?? null,
        esFueraDeTiempo: evidencia?.esFueraDeTiempo ?? false,
        fechaUltimaEvidencia: evidencia?.fechaSubida ?? null,
        motivoRechazo: evidencia?.motivoRechazo ?? null,
        intentos: todasEvidencias.length,
        archivoUrl: evidencia?.archivoUrl ?? null,
        nombreArchivo: evidencia?.nombre ?? null,
      };
    });

    // Métricas resumen
    const aprobados = kpisDetalle.filter((k) => k.estado === 'aprobado').length;
    const rechazados = kpisDetalle.filter(
      (k) => k.estado === 'rechazado',
    ).length;
    const enRevision = kpisDetalle.filter(
      (k) => k.estado === 'pendiente_revision',
    ).length;
    const pendientes = kpisDetalle.filter(
      (k) => k.estado === 'pendiente',
    ).length;
    const fueraDeTiempo = kpisDetalle.filter((k) => k.esFueraDeTiempo).length;

    return {
      empleado,
      periodo,
      kpis: kpisDetalle,
      resumen: {
        total: kpis.length,
        aprobados,
        rechazados,
        enRevision,
        pendientes,
        fueraDeTiempo,
        porcentajeCumplimiento:
          kpis.length > 0 ? Math.round((aprobados / kpis.length) * 100) : 0,
      },
    };
  }

  // ============================================
  // DETALLE ÓRDENES DE UN EMPLEADO
  // ============================================
  async getEmpleadoOrdenes(empleadoId: string) {
    const empleado = await this.prisma.user.findUnique({
      where: { id: empleadoId },
      select: { id: true, nombre: true, apellido: true },
    });

    if (!empleado) return null;

    const ordenes = await this.prisma.ordenTrabajo.findMany({
      where: { empleadoId },
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        status: true,
        fechaInicio: true,
        fechaLimite: true,
        fechaCompletada: true,
        progreso: true,
        cantidadTareas: true,
        tareasCompletadas: true,
        tipoOrden: true,
        kpi: { select: { id: true, indicador: true, key: true } },
        creador: { select: { nombre: true, apellido: true } },
        tareas: {
          select: {
            id: true,
            descripcion: true,
            completada: true,
            fueraDeTiempo: true,
            orden: true,
            evidencias: {
              select: {
                id: true,
                status: true,
                esFueraDeTiempo: true,
                fechaSubida: true,
                motivoRechazo: true,
                intento: true,
              },
              orderBy: { fechaSubida: 'desc' },
              take: 1, // solo la más reciente por tarea
            },
          },
          orderBy: { orden: 'asc' },
        },
      },
      orderBy: { fechaInicio: 'desc' },
    });

    const ahora = new Date();

    const ordenesDetalle = ordenes.map((orden) => {
      const diasRestantes = Math.ceil(
        (new Date(orden.fechaLimite).getTime() - ahora.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const vencida =
        diasRestantes < 0 &&
        !['completada', 'aprobada', 'cancelada'].includes(orden.status);
      const urgente =
        diasRestantes >= 0 &&
        diasRestantes <= 3 &&
        !['completada', 'aprobada', 'cancelada'].includes(orden.status);

      const evidenciasPendientes = orden.tareas.filter(
        (t) => t.evidencias[0]?.status === 'pendiente_revision',
      ).length;

      const evidenciasRechazadas = orden.tareas.filter(
        (t) => t.evidencias[0]?.status === 'rechazada',
      ).length;

      return {
        ...orden,
        diasRestantes,
        vencida,
        urgente,
        evidenciasPendientes,
        evidenciasRechazadas,
      };
    });

    // Métricas resumen
    const completadas = ordenesDetalle.filter((o) =>
      ['completada', 'aprobada'].includes(o.status),
    ).length;
    const activas = ordenesDetalle.filter((o) =>
      ['pendiente', 'en_proceso'].includes(o.status),
    ).length;
    const vencidas = ordenesDetalle.filter((o) => o.vencida).length;
    const tasaCumplimiento =
      ordenes.length > 0 ? Math.round((completadas / ordenes.length) * 100) : 0;

    return {
      empleado,
      ordenes: ordenesDetalle,
      resumen: {
        total: ordenes.length,
        activas,
        completadas,
        vencidas,
        tasaCumplimiento,
      },
    };
  }
}
