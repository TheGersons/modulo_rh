import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

interface FiltrosBase {
  periodo?: string;
  areaId?: string;
  empleadoId?: string;
  status?: string;
  fueraDeTiempo?: boolean;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class AuditoriaService {
  constructor(private prisma: PrismaService) {}

  // Resuelve el set de áreas a filtrar: si areaId es una principal, incluye sub-áreas
  private async resolverAreas(areaId?: string): Promise<string[] | null> {
    if (!areaId) return null;
    const sub = await this.prisma.area.findMany({
      where: { areaPadreId: areaId },
      select: { id: true },
    });
    return [areaId, ...sub.map((s) => s.id)];
  }

  async getEvidenciasKpi(filtros: FiltrosBase) {
    const page = Math.max(1, filtros.page ?? 1);
    const pageSize = Math.min(100, Math.max(5, filtros.pageSize ?? 20));
    const skip = (page - 1) * pageSize;

    const areasIds = await this.resolverAreas(filtros.areaId);

    const where: any = { tipo: { not: 'nota_kpi' } };
    if (filtros.periodo) where.periodo = filtros.periodo;
    if (filtros.status) where.status = filtros.status;
    if (filtros.fueraDeTiempo !== undefined)
      where.esFueraDeTiempo = filtros.fueraDeTiempo;
    if (filtros.empleadoId) where.empleadoId = filtros.empleadoId;
    if (areasIds) where.empleado = { areaId: { in: areasIds } };

    const [items, total] = await Promise.all([
      this.prisma.evidenciaKPI.findMany({
        where,
        select: {
          id: true,
          archivoUrl: true,
          nombre: true,
          tipo: true,
          tamanio: true,
          fechaSubida: true,
          status: true,
          esFueraDeTiempo: true,
          esRespaldoGracia: true,
          periodo: true,
          intento: true,
          motivoRechazo: true,
          valorNumerico: true,
          kpi: {
            select: {
              key: true,
              indicador: true,
              area: true,
              tipoCriticidad: true,
            },
          },
          empleado: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              area: { select: { id: true, nombre: true } },
              puesto: { select: { id: true, nombre: true } },
            },
          },
        },
        orderBy: { fechaSubida: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.evidenciaKPI.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getEvidenciasOrden(filtros: FiltrosBase) {
    const page = Math.max(1, filtros.page ?? 1);
    const pageSize = Math.min(100, Math.max(5, filtros.pageSize ?? 20));
    const skip = (page - 1) * pageSize;

    const areasIds = await this.resolverAreas(filtros.areaId);

    const where: any = {};
    if (filtros.status) where.status = filtros.status;
    if (filtros.fueraDeTiempo !== undefined)
      where.esFueraDeTiempo = filtros.fueraDeTiempo;

    // Filtros por empleado/área llegan vía relación tarea → ordenTrabajo → empleado
    const tareaWhere: any = {};
    if (filtros.empleadoId || areasIds) {
      tareaWhere.ordenTrabajo = {};
      if (filtros.empleadoId) tareaWhere.ordenTrabajo.empleadoId = filtros.empleadoId;
      if (areasIds) tareaWhere.ordenTrabajo.empleado = { areaId: { in: areasIds } };
    }
    if (filtros.periodo) {
      // Una orden pertenece al período si su fechaLimite cae en él
      const [y, m] = filtros.periodo.split('-').map(Number);
      tareaWhere.ordenTrabajo = {
        ...(tareaWhere.ordenTrabajo ?? {}),
        fechaLimite: {
          gte: new Date(y, m - 1, 1),
          lt: new Date(y, m, 1),
        },
      };
    }
    if (Object.keys(tareaWhere).length > 0) where.tarea = tareaWhere;

    const [items, total] = await Promise.all([
      this.prisma.evidencia.findMany({
        where,
        select: {
          id: true,
          archivoUrl: true,
          nombre: true,
          tipo: true,
          tamanio: true,
          fechaSubida: true,
          status: true,
          esFueraDeTiempo: true,
          intento: true,
          motivoRechazo: true,
          tarea: {
            select: {
              descripcion: true,
              orden: true,
              ordenTrabajo: {
                select: {
                  id: true,
                  titulo: true,
                  fechaLimite: true,
                  empleado: {
                    select: {
                      id: true,
                      nombre: true,
                      apellido: true,
                      area: { select: { id: true, nombre: true } },
                      puesto: { select: { id: true, nombre: true } },
                    },
                  },
                  kpi: { select: { key: true, indicador: true } },
                },
              },
            },
          },
        },
        orderBy: { fechaSubida: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.evidencia.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getResumen(filtros: FiltrosBase) {
    const areasIds = await this.resolverAreas(filtros.areaId);
    const wKpi: any = { tipo: { not: 'nota_kpi' } };
    if (filtros.periodo) wKpi.periodo = filtros.periodo;
    if (filtros.empleadoId) wKpi.empleadoId = filtros.empleadoId;
    if (areasIds) wKpi.empleado = { areaId: { in: areasIds } };

    const [
      totalKpi,
      aprobadasKpi,
      pendientesKpi,
      rechazadasKpi,
      fueraTiempoKpi,
    ] = await Promise.all([
      this.prisma.evidenciaKPI.count({ where: wKpi }),
      this.prisma.evidenciaKPI.count({ where: { ...wKpi, status: 'aprobada' } }),
      this.prisma.evidenciaKPI.count({
        where: { ...wKpi, status: 'pendiente_revision' },
      }),
      this.prisma.evidenciaKPI.count({
        where: { ...wKpi, status: 'rechazada' },
      }),
      this.prisma.evidenciaKPI.count({
        where: { ...wKpi, esFueraDeTiempo: true },
      }),
    ]);

    const tareaWhere: any = {};
    if (filtros.empleadoId || areasIds) {
      tareaWhere.ordenTrabajo = {};
      if (filtros.empleadoId) tareaWhere.ordenTrabajo.empleadoId = filtros.empleadoId;
      if (areasIds) tareaWhere.ordenTrabajo.empleado = { areaId: { in: areasIds } };
    }
    if (filtros.periodo) {
      const [y, m] = filtros.periodo.split('-').map(Number);
      tareaWhere.ordenTrabajo = {
        ...(tareaWhere.ordenTrabajo ?? {}),
        fechaLimite: {
          gte: new Date(y, m - 1, 1),
          lt: new Date(y, m, 1),
        },
      };
    }
    const wOrden: any = {};
    if (Object.keys(tareaWhere).length > 0) wOrden.tarea = tareaWhere;

    const [
      totalOrden,
      aprobadasOrden,
      pendientesOrden,
      rechazadasOrden,
      fueraTiempoOrden,
    ] = await Promise.all([
      this.prisma.evidencia.count({ where: wOrden }),
      this.prisma.evidencia.count({ where: { ...wOrden, status: 'aprobada' } }),
      this.prisma.evidencia.count({
        where: { ...wOrden, status: 'pendiente_revision' },
      }),
      this.prisma.evidencia.count({
        where: { ...wOrden, status: 'rechazada' },
      }),
      this.prisma.evidencia.count({
        where: { ...wOrden, esFueraDeTiempo: true },
      }),
    ]);

    return {
      kpi: {
        total: totalKpi,
        aprobadas: aprobadasKpi,
        pendientes: pendientesKpi,
        rechazadas: rechazadasKpi,
        fueraTiempo: fueraTiempoKpi,
      },
      orden: {
        total: totalOrden,
        aprobadas: aprobadasOrden,
        pendientes: pendientesOrden,
        rechazadas: rechazadasOrden,
        fueraTiempo: fueraTiempoOrden,
      },
      total: totalKpi + totalOrden,
    };
  }
}
