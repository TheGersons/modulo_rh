import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';

@Injectable()
export class AlertasService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // CREAR ALERTA
  // ============================================
  async create(createAlertaDto: CreateAlertaDto) {
    const alerta = await this.prisma.alerta.create({
      data: {
        ...createAlertaDto,
        fechaDeteccion: new Date(),
      },
      include: {
        area: {
          select: {
            nombre: true,
          },
        },
        empleado: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return alerta;
  }

  // ============================================
  // LISTAR ALERTAS
  // ============================================
  async findAll(filters?: {
    areaId?: string;
    empleadoId?: string;
    tipo?: string;
    nivel?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters?.areaId) where.areaId = filters.areaId;
    if (filters?.empleadoId) where.empleadoId = filters.empleadoId;
    if (filters?.tipo) where.tipo = filters.tipo;
    if (filters?.nivel) where.nivel = filters.nivel;
    if (filters?.status) where.status = filters.status;

    const alertas = await this.prisma.alerta.findMany({
      where,
      include: {
        area: {
          select: {
            nombre: true,
          },
        },
        empleado: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: [
        { nivel: 'desc' }, // ALTO primero
        { fechaDeteccion: 'desc' },
      ],
    });

    return alertas;
  }

  // ============================================
  // OBTENER ALERTA POR ID
  // ============================================
  async findOne(id: string) {
    const alerta = await this.prisma.alerta.findUnique({
      where: { id },
      include: {
        area: {
          select: {
            nombre: true,
          },
        },
        empleado: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        evaluacion: true,
      },
    });

    if (!alerta) {
      throw new NotFoundException(`Alerta con ID ${id} no encontrada`);
    }

    return alerta;
  }

  // ============================================
  // ACTUALIZAR ALERTA
  // ============================================
  async update(id: string, updateAlertaDto: UpdateAlertaDto) {
    await this.findOne(id);

    const data: any = { ...updateAlertaDto };

    // Si se marca como resuelta, agregar fecha
    if (updateAlertaDto.status === 'resuelta') {
      data.fechaResolucion = new Date();
    }

    const alerta = await this.prisma.alerta.update({
      where: { id },
      data,
      include: {
        area: {
          select: {
            nombre: true,
          },
        },
        empleado: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return alerta;
  }

  // ============================================
  // RESOLVER ALERTA
  // ============================================
  async resolver(id: string) {
    return this.update(id, { status: 'resuelta' });
  }

  // ============================================
  // ELIMINAR ALERTA
  // ============================================
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.alerta.delete({
      where: { id },
    });

    return { message: 'Alerta eliminada exitosamente' };
  }

  // ============================================
  // OBTENER ESTADÍSTICAS
  // ============================================
  async getEstadisticas(areaId?: string) {
    const where: any = {};
    if (areaId) where.areaId = areaId;

    const [total, activas, porNivel, porTipo] = await Promise.all([
      this.prisma.alerta.count({ where }),
      this.prisma.alerta.count({ where: { ...where, status: 'activa' } }),
      this.prisma.alerta.groupBy({
        by: ['nivel'],
        where,
        _count: true,
      }),
      this.prisma.alerta.groupBy({
        by: ['tipo'],
        where: { ...where, status: 'activa' },
        _count: true,
      }),
    ]);

    return {
      total,
      activas,
      porNivel: porNivel.reduce(
        (acc, item) => {
          acc[item.nivel] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      porTipo: porTipo.reduce(
        (acc, item) => {
          acc[item.tipo] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  // ============================================
  // ALERTAS DESDE ÓRDENES DE TRABAJO
  // ============================================

  // Orden completada
  async alertaOrdenCompletada(orden: any) {
    const empleado = await this.prisma.user.findUnique({
      where: { id: orden.empleadoId },
      select: { areaId: true, nombre: true, apellido: true },
    });

    if (!empleado?.areaId) return;

    return this.create({
      areaId: empleado.areaId,
      empleadoId: orden.empleadoId,
      tipo: 'orden_completada',
      nivel: 'BAJO',
      titulo: 'Orden de trabajo completada',
      descripcion: `${empleado.nombre} ${empleado.apellido} completó la orden "${orden.titulo}"`,
      accionSugerida: 'Revisar evidencias y aprobar',
      responsable: 'Jefe de área',
    });
  }

  // Orden vencida
  async alertaOrdenVencida(orden: any) {
    const empleado = await this.prisma.user.findUnique({
      where: { id: orden.empleadoId },
      select: { areaId: true, nombre: true, apellido: true },
    });

    if (!empleado?.areaId) return;

    const diasVencidos = Math.floor(
      (new Date().getTime() - new Date(orden.fechaLimite).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return this.create({
      areaId: empleado.areaId,
      empleadoId: orden.empleadoId,
      tipo: 'orden_vencida',
      nivel: 'ALTO',
      titulo: 'Orden de trabajo vencida',
      descripcion: `La orden "${orden.titulo}" venció hace ${diasVencidos} días sin completarse`,
      accionSugerida:
        'Contactar al empleado y revisar motivo del incumplimiento',
      responsable: 'Jefe de área',
    });
  }

  // Orden por vencer (3 días antes)
  async alertaOrdenPorVencer(orden: any) {
    const empleado = await this.prisma.user.findUnique({
      where: { id: orden.empleadoId },
      select: { areaId: true, nombre: true, apellido: true },
    });

    if (!empleado?.areaId) return;

    const diasRestantes = Math.ceil(
      (new Date(orden.fechaLimite).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return this.create({
      areaId: empleado.areaId,
      empleadoId: orden.empleadoId,
      tipo: 'orden_por_vencer',
      nivel: 'MEDIO',
      titulo: 'Orden de trabajo próxima a vencer',
      descripcion: `La orden "${orden.titulo}" vence en ${diasRestantes} días`,
      accionSugerida: 'Recordar al empleado completar la orden',
      responsable: 'Empleado asignado',
    });
  }

  // Evidencia rechazada
  async alertaEvidenciaRechazada(evidencia: any, tarea: any, orden: any) {
    const empleado = await this.prisma.user.findUnique({
      where: { id: orden.empleadoId },
      select: { areaId: true, nombre: true, apellido: true },
    });

    if (!empleado?.areaId) return;

    return this.create({
      areaId: empleado.areaId,
      empleadoId: orden.empleadoId,
      tipo: 'evidencia_rechazada',
      nivel: 'MEDIO',
      titulo: 'Evidencia rechazada',
      descripcion: `Se rechazó la evidencia de "${tarea.descripcion}". Motivo: ${evidencia.motivoRechazo}`,
      accionSugerida: 'Corregir y volver a subir evidencia',
      responsable: 'Empleado asignado',
    });
  }

  // Evidencia aprobada
  async alertaEvidenciaAprobada(tarea: any, orden: any) {
    const empleado = await this.prisma.user.findUnique({
      where: { id: orden.empleadoId },
      select: { areaId: true, nombre: true, apellido: true },
    });

    if (!empleado?.areaId) return;

    return this.create({
      areaId: empleado.areaId,
      empleadoId: orden.empleadoId,
      tipo: 'evidencia_aprobada',
      nivel: 'BAJO',
      titulo: 'Evidencia aprobada',
      descripcion: `Se aprobó la evidencia de "${tarea.descripcion}"`,
      accionSugerida: 'Continuar con las siguientes tareas',
      responsable: 'Empleado asignado',
    });
  }

  // Evidencia apelada
  async alertaEvidenciaApelada(evidencia: any, tarea: any, orden: any) {
    const empleado = await this.prisma.user.findUnique({
      where: { id: orden.empleadoId },
      select: { areaId: true },
    });

    if (!empleado?.areaId) return;

    return this.create({
      areaId: empleado.areaId,
      tipo: 'evidencia_apelada',
      nivel: 'MEDIO',
      titulo: 'Evidencia apelada por empleado',
      descripcion: `El empleado apeló el rechazo de "${tarea.descripcion}". Apelación: ${evidencia.apelacion}`,
      accionSugerida: 'Revisar apelación y responder',
      responsable: 'Jefe de área',
    });
  }

  // Solicitud de tarea pendiente
  async alertaSolicitudTareaPendiente(solicitud: any, orden: any) {
    const empleado =
      solicitud.empleado ??
      (await this.prisma.user.findUnique({
        where: { id: solicitud.empleadoId },
        select: { areaId: true, nombre: true, apellido: true },
      }));

    if (!empleado?.areaId) return;

    return this.create({
      areaId: empleado.areaId,
      tipo: 'solicitud_tarea_pendiente',
      nivel: 'MEDIO',
      titulo: 'Solicitud de tarea adicional',
      descripcion: `${empleado.nombre} ${empleado.apellido} solicitó agregar: "${solicitud.descripcion}"`,
      accionSugerida: 'Revisar y aprobar/rechazar solicitud',
      responsable: 'Jefe de área',
    });
  }

  // Solicitud de edición pendiente
  async alertaSolicitudEdicionPendiente(solicitud: any, orden: any) {
    const empleado = await this.prisma.user.findUnique({
      where: { id: solicitud.solicitanteId },
      select: { areaId: true, nombre: true, apellido: true },
    });

    if (!empleado?.areaId) return;

    return this.create({
      areaId: empleado.areaId,
      tipo: 'solicitud_edicion_pendiente',
      nivel: 'MEDIO',
      titulo: 'Solicitud de edición de orden',
      descripcion: `${empleado.nombre} ${empleado.apellido} solicita cambiar ${solicitud.campoAEditar}`,
      accionSugerida: 'Revisar y aprobar/rechazar solicitud',
      responsable: 'Jefe de área',
    });
  }

  // ============================================
  // DETECCIÓN AUTOMÁTICA DE ALERTAS
  // ============================================
  async generarAlertasAutomaticas() {
    console.log('🔍 Ejecutando detección automática de alertas...');

    let alertasGeneradas = 0;

    // 1. Órdenes vencidas
    const ordenesVencidas = await this.prisma.ordenTrabajo.findMany({
      where: {
        status: { in: ['pendiente', 'en_proceso'] },
        fechaLimite: { lt: new Date() },
      },
    });

    for (const orden of ordenesVencidas) {
      // Verificar si ya existe alerta activa para esta orden
      const alertaExistente = await this.prisma.alerta.findFirst({
        where: {
          empleadoId: orden.empleadoId,
          tipo: 'orden_vencida',
          status: { in: ['activa', 'en_proceso'] },
        },
      });

      if (!alertaExistente) {
        await this.alertaOrdenVencida(orden);
        alertasGeneradas++;
      }
    }

    // 2. Órdenes por vencer (3 días)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 3);

    const ordenesPorVencer = await this.prisma.ordenTrabajo.findMany({
      where: {
        status: { in: ['pendiente', 'en_proceso'] },
        fechaLimite: {
          gte: new Date(),
          lte: fechaLimite,
        },
      },
    });

    for (const orden of ordenesPorVencer) {
      const alertaExistente = await this.prisma.alerta.findFirst({
        where: {
          empleadoId: orden.empleadoId,
          tipo: 'orden_por_vencer',
          status: { in: ['activa', 'en_proceso'] },
        },
      });

      if (!alertaExistente) {
        await this.alertaOrdenPorVencer(orden);
        alertasGeneradas++;
      }
    }

    // 3. Solicitudes de tarea pendientes (>2 días)
    const fechaLimiteSolicitudes = new Date();
    fechaLimiteSolicitudes.setDate(fechaLimiteSolicitudes.getDate() - 2);

    const solicitudesPendientes = await this.prisma.solicitudTarea.findMany({
      where: {
        status: 'pendiente',
        fechaSolicitud: { lt: fechaLimiteSolicitudes },
      },
      include: {
        ordenTrabajo: true,
      },
    });

    for (const solicitud of solicitudesPendientes) {
      const alertaExistente = await this.prisma.alerta.findFirst({
        where: {
          tipo: 'solicitud_tarea_pendiente',
          status: { in: ['activa', 'en_proceso'] },
        },
      });

      if (!alertaExistente) {
        await this.alertaSolicitudTareaPendiente(
          solicitud,
          solicitud.ordenTrabajo,
        );
        alertasGeneradas++;
      }
    }

    console.log(`✅ ${alertasGeneradas} alertas generadas automáticamente`);

    return {
      mensaje: 'Detección automática completada',
      alertasGeneradas,
    };
  }
}
