import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { SubirEvidenciaDto } from './dto/subir-evidencia-dto';
import { RevisarEvidenciaDto } from './dto/revisar-evidencia.dto';
import { ApelarEvidenciaDto } from './dto/apelar-evidencias.dto';
import { SolicitarTareaDto } from './dto/solicitar-tarea.dto';
import { ResponderSolicitudTareaDto } from './dto/responder-solicitud-tarea.dto';
import { SolicitarEdicionDto } from './dto/solicitar-edicion.dto';
import { ResponderSolicitudEdicionDto } from './dto/responder-solicitud-edicion.dto';
import { AlertasService } from '../alertas/alertas.service';

@Injectable()
export class OrdenesTrabajoService {
  constructor(
    private prisma: PrismaService,
    private alertasService: AlertasService,
  ) {}

  // ============================================
  // CREAR ORDEN DE TRABAJO
  // ============================================
  async create(createDto: CreateOrdenTrabajoDto, creadorId: string) {
    // Validar que el KPI existe
    const kpi = await this.prisma.kPI.findUnique({
      where: { id: createDto.kpiId },
    });

    if (!kpi) {
      throw new NotFoundException(
        `KPI con ID ${createDto.kpiId} no encontrado`,
      );
    }

    // Validar que el empleado existe
    const empleado = await this.prisma.user.findUnique({
      where: { id: createDto.empleadoId },
    });

    if (!empleado) {
      throw new NotFoundException(
        `Empleado con ID ${createDto.empleadoId} no encontrado`,
      );
    }

    // Crear orden
    const orden = await this.prisma.ordenTrabajo.create({
      data: {
        kpiId: createDto.kpiId,
        empleadoId: createDto.empleadoId,
        creadorId,
        titulo: createDto.titulo,
        descripcion: createDto.descripcion,
        cantidadTareas: createDto.cantidadTareas,
        fechaLimite: new Date(createDto.fechaLimite),
        fechaLimiteOriginal: new Date(createDto.fechaLimite),
        tipoOrden: createDto.tipoOrden || 'kpi_sistema',
        status: 'pendiente',
      },
      include: {
        kpi: {
          select: {
            key: true,
            indicador: true,
          },
        },
        empleado: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        creador: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    // Crear tareas si se proporcionaron
    if (createDto.tareas && createDto.tareas.length > 0) {
      for (const tarea of createDto.tareas) {
        await this.prisma.tarea.create({
          data: {
            ordenTrabajoId: orden.id,
            descripcion: tarea.descripcion,
            orden: tarea.orden,
            fechaLimite: new Date(createDto.fechaLimite),
          },
        });
      }
    }

    // TODO: Generar alerta para el empleado

    return orden;
  }

  // ============================================
  // CREAR MÚLTIPLES ÓRDENES (BULK)
  // ============================================
  async createBulk(
    createDto: CreateOrdenTrabajoDto,
    empleadoIds: string[],
    creadorId: string,
  ) {
    const ordenesCreadas: any[] = []; // ← Agregar tipo

    for (const empleadoId of empleadoIds) {
      const orden = await this.create({ ...createDto, empleadoId }, creadorId);
      ordenesCreadas.push(orden);
    }

    return {
      mensaje: `${ordenesCreadas.length} órdenes creadas exitosamente`,
      ordenes: ordenesCreadas,
    };
  }

  // ============================================
  // LISTAR ÓRDENES
  // ============================================
  async findAll(filters?: {
    empleadoId?: string;
    creadorId?: string;
    kpiId?: string;
    status?: string;
    tipoOrden?: string;
    areaId?: string;
  }) {
    const where: any = {};

    if (filters?.empleadoId) where.empleadoId = filters.empleadoId;
    if (filters?.creadorId) where.creadorId = filters.creadorId;
    if (filters?.kpiId) where.kpiId = filters.kpiId;
    if (filters?.status) where.status = filters.status;
    if (filters?.tipoOrden) where.tipoOrden = filters.tipoOrden;

    if (filters?.areaId) {
      where.empleado = {
        OR: [
          { areaId: filters.areaId },
          { area: { areaPadreId: filters.areaId } },
        ],
      };
    }

    const ordenes = await this.prisma.ordenTrabajo.findMany({
      where,
      include: {
        kpi: {
          select: {
            key: true,
            indicador: true,
          },
        },
        empleado: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        creador: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        tareas: {
          select: {
            id: true,
            descripcion: true,
            completada: true,
            fueraDeTiempo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ordenes;
  }

  // ============================================
  // OBTENER ORDEN POR ID
  // ============================================
  async findOne(id: string) {
    const orden = await this.prisma.ordenTrabajo.findUnique({
      where: { id },
      include: {
        kpi: true,
        empleado: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            puesto: true,
            area: {
              select: {
                nombre: true,
              },
            },
          },
        },
        creador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        tareas: {
          include: {
            evidencias: true,
          },
          orderBy: { orden: 'asc' },
        },
        revision: true,
        solicitudesTarea: {
          include: {
            empleado: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
          },
          orderBy: { fechaSolicitud: 'desc' },
        },
        solicitudesEdicion: {
          include: {
            solicitante: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
          },
          orderBy: { fechaSolicitud: 'desc' },
        },
      },
    });

    if (!orden) {
      throw new NotFoundException(
        `Orden de trabajo con ID ${id} no encontrada`,
      );
    }

    return orden;
  }

  // ============================================
  // ACTUALIZAR ORDEN
  // ============================================
  async update(id: string, updateDto: UpdateOrdenTrabajoDto) {
    await this.findOne(id);

    const orden = await this.prisma.ordenTrabajo.update({
      where: { id },
      data: updateDto,
      include: {
        kpi: {
          select: {
            key: true,
            indicador: true,
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

    return orden;
  }

  // ============================================
  // PAUSAR ORDEN
  // ============================================
  async pausar(id: string, motivo: string) {
    const orden = await this.findOne(id);

    if (orden.status === 'completada' || orden.status === 'aprobada') {
      throw new BadRequestException(
        'No se puede pausar una orden completada o aprobada',
      );
    }

    return this.update(id, {
      status: 'en_pausa',
      enPausa: true,
      motivoPausa: motivo,
    });
  }

  // ============================================
  // REANUDAR ORDEN
  // ============================================
  async reanudar(id: string) {
    const orden = await this.findOne(id);

    if (!orden.enPausa) {
      throw new BadRequestException('La orden no está pausada');
    }

    return this.update(id, {
      status: 'en_proceso',
      enPausa: false,
    });
  }

  // ============================================
  // CANCELAR ORDEN
  // ============================================
  async cancelar(id: string) {
    const orden = await this.findOne(id);

    if (orden.status === 'completada' || orden.status === 'aprobada') {
      throw new BadRequestException(
        'No se puede cancelar una orden completada o aprobada',
      );
    }

    return this.update(id, {
      status: 'cancelada',
    });
  }

  // ============================================
  // EXTENDER FECHA LÍMITE
  // ============================================
  async extenderFechaLimite(id: string, nuevaFecha: string, motivo: string) {
    const orden = await this.findOne(id);

    // Solo se puede extender órdenes de tipo "orden_empleado"
    if (orden.tipoOrden !== 'orden_empleado') {
      throw new BadRequestException(
        'Solo se pueden extender fechas de órdenes solicitadas por empleados',
      );
    }

    const fechaExtendida = new Date(nuevaFecha);
    const fechaActual = orden.fechaExtendida
      ? new Date(orden.fechaExtendida)
      : new Date(orden.fechaLimite);

    if (fechaExtendida <= fechaActual) {
      throw new BadRequestException(
        'La nueva fecha debe ser posterior a la fecha actual',
      );
    }

    return this.prisma.ordenTrabajo.update({
      where: { id },
      data: {
        fechaExtendida,
        motivoExtension: motivo,
        fechaLimite: fechaExtendida,
      },
    });
  }

  // ============================================
  // CALCULAR PROGRESO
  // ============================================
  async calcularProgreso(id: string) {
    const orden = await this.findOne(id);

    const tareasCompletadas = orden.tareas.filter((t) => t.completada).length;
    const totalTareas = orden.tareas.length;
    const progreso =
      totalTareas > 0 ? (tareasCompletadas / totalTareas) * 100 : 0;

    await this.prisma.ordenTrabajo.update({
      where: { id },
      data: {
        tareasCompletadas,
        progreso,
      },
    });

    // Si todas las tareas están completadas, cambiar status
    if (progreso === 100 && orden.status !== 'completada') {
      await this.update(id, {
        status: 'completada',
      });
      await this.alertasService.alertaOrdenCompletada(orden);
    }

    return { tareasCompletadas, totalTareas, progreso };
  }

  // ============================================
  // TAREAS - CREAR
  // ============================================
  async crearTarea(createDto: CreateTareaDto) {
    const orden = await this.findOne(createDto.ordenTrabajoId);

    if (
      orden.status === 'completada' ||
      orden.status === 'aprobada' ||
      orden.status === 'cancelada'
    ) {
      throw new BadRequestException('No se pueden agregar tareas a esta orden');
    }

    const tarea = await this.prisma.tarea.create({
      data: {
        ordenTrabajoId: createDto.ordenTrabajoId,
        descripcion: createDto.descripcion,
        orden: createDto.orden,
        fechaLimite: orden.fechaLimite,
        solicitudAgregar: createDto.solicitudAgregar || false,
      },
    });

    // Actualizar cantidadTareas de la orden
    await this.prisma.ordenTrabajo.update({
      where: { id: createDto.ordenTrabajoId },
      data: {
        cantidadTareas: { increment: 1 },
      },
    });

    return tarea;
  }

  // ============================================
  // TAREAS - OBTENER DE UNA ORDEN
  // ============================================
  async getTareas(ordenTrabajoId: string) {
    const orden = await this.findOne(ordenTrabajoId);

    return this.prisma.tarea.findMany({
      where: { ordenTrabajoId },
      include: {
        evidencias: {
          orderBy: { intento: 'desc' },
        },
      },
      orderBy: { orden: 'asc' },
    });
  }

  // ============================================
  // TAREAS - OBTENER UNA ESPECÍFICA
  // ============================================
  async getTarea(id: string) {
    const tarea = await this.prisma.tarea.findUnique({
      where: { id },
      include: {
        ordenTrabajo: true,
        evidencias: {
          orderBy: { intento: 'desc' },
        },
      },
    });

    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }

    return tarea;
  }

  // ============================================
  // EVIDENCIAS - SUBIR
  // ============================================
  async subirEvidencia(subirDto: SubirEvidenciaDto) {
    const tarea = await this.getTarea(subirDto.tareaId);

    // Verificar si la tarea ya está completada y aprobada
    if (
      tarea.completada &&
      tarea.evidencias.some((e) => e.status === 'aprobada')
    ) {
      throw new BadRequestException('Esta tarea ya tiene evidencia aprobada');
    }

    // Calcular número de intento
    const intentoActual = tarea.intentosEvidencia + 1;

    // Verificar si está fuera de tiempo
    const ahora = new Date();
    const fechaLimite = tarea.fechaLimite || tarea.ordenTrabajo.fechaLimite;
    const esFueraDeTiempo = ahora > new Date(fechaLimite);

    const evidencia = await this.prisma.evidencia.create({
      data: {
        tareaId: subirDto.tareaId,
        archivoUrl: subirDto.archivoUrl,
        tipo: subirDto.tipo,
        nombre: subirDto.nombre,
        tamanio: subirDto.tamanio,
        intento: intentoActual,
        esFueraDeTiempo,
        status: 'pendiente_revision',
      },
    });

    // Actualizar contador de intentos
    await this.prisma.tarea.update({
      where: { id: subirDto.tareaId },
      data: {
        intentosEvidencia: intentoActual,
        fueraDeTiempo: esFueraDeTiempo,
      },
    });

    // Actualizar status de la orden a "en_proceso" si está en "pendiente"
    if (tarea.ordenTrabajo.status === 'pendiente') {
      await this.update(tarea.ordenTrabajoId, { status: 'en_proceso' });
    }

    // TODO: Generar alerta para el jefe

    return evidencia;
  }

  // ============================================
  // EVIDENCIAS - REVISAR (JEFE)
  // ============================================
  async revisarEvidencia(
    evidenciaId: string,
    revisarDto: RevisarEvidenciaDto,
    jefeId: string,
  ) {
    const evidencia = await this.prisma.evidencia.findUnique({
      where: { id: evidenciaId },
      include: {
        tarea: {
          include: {
            ordenTrabajo: true,
          },
        },
      },
    });

    if (!evidencia) {
      throw new NotFoundException(
        `Evidencia con ID ${evidenciaId} no encontrada`,
      );
    }

    if (evidencia.status !== 'pendiente_revision') {
      throw new BadRequestException('Esta evidencia ya fue revisada');
    }

    // Actualizar evidencia
    const evidenciaActualizada = await this.prisma.evidencia.update({
      where: { id: evidenciaId },
      data: {
        status: revisarDto.status,
        motivoRechazo: revisarDto.motivoRechazo,
      },
    });

    // Si fue aprobada, marcar tarea como completada
    if (revisarDto.status === 'aprobada') {
      await this.prisma.tarea.update({
        where: { id: evidencia.tareaId },
        data: {
          completada: true,
          fechaCompletada: new Date(),
        },
      });

      // Recalcular progreso de la orden
      await this.calcularProgreso(evidencia.tarea.ordenTrabajoId);
      const tarea = await this.getTarea(evidencia.tareaId);
      await this.alertasService.alertaEvidenciaAprobada(
        tarea,
        tarea.ordenTrabajo,
      );
    }

    // Si fue rechazada, actualizar status de la orden a "rechazada"
    if (revisarDto.status === 'rechazada') {
      await this.update(evidencia.tarea.ordenTrabajoId, {
        status: 'rechazada',
      });

      const tarea = await this.getTarea(evidencia.tareaId);
      await this.alertasService.alertaEvidenciaRechazada(
        evidenciaActualizada,
        tarea,
        tarea.ordenTrabajo,
      );
    }

    return evidenciaActualizada;
  }

  // ============================================
  // EVIDENCIAS - APELAR
  // ============================================
  async apelarEvidencia(evidenciaId: string, apelarDto: ApelarEvidenciaDto) {
    const evidencia = await this.prisma.evidencia.findUnique({
      where: { id: evidenciaId },
    });

    if (!evidencia) {
      throw new NotFoundException(
        `Evidencia con ID ${evidenciaId} no encontrada`,
      );
    }

    if (evidencia.status !== 'rechazada') {
      throw new BadRequestException(
        'Solo se pueden apelar evidencias rechazadas',
      );
    }

    if (evidencia.apelacion) {
      throw new BadRequestException('Esta evidencia ya tiene una apelación');
    }

    const evidenciaApelada = await this.prisma.evidencia.update({
      where: { id: evidenciaId },
      data: {
        apelacion: apelarDto.apelacion,
        fechaApelacion: new Date(),
      },
    });

    const evidenciaBase = await this.prisma.evidencia.findUnique({
      where: { id: evidenciaId },
      include: { tarea: { include: { ordenTrabajo: true } } },
    });

    await this.alertasService.alertaEvidenciaApelada(
      evidenciaApelada,
      evidenciaBase!.tarea,
      evidenciaBase!.tarea.ordenTrabajo,
    );

    return evidenciaApelada;
  }

  // ============================================
  // EVIDENCIAS - RESPONDER APELACIÓN (JEFE)
  // ============================================
  async responderApelacion(
    evidenciaId: string,
    respuesta: string,
    confirmaRechazo: boolean,
  ) {
    const evidencia = await this.prisma.evidencia.findUnique({
      where: { id: evidenciaId },
      include: {
        tarea: true,
      },
    });

    if (!evidencia) {
      throw new NotFoundException(
        `Evidencia con ID ${evidenciaId} no encontrada`,
      );
    }

    if (!evidencia.apelacion) {
      throw new BadRequestException('Esta evidencia no tiene apelación');
    }

    const evidenciaActualizada = await this.prisma.evidencia.update({
      where: { id: evidenciaId },
      data: {
        respuestaApelacion: respuesta,
      },
    });

    // Si se confirma el rechazo, el empleado debe volver a subir evidencia
    if (confirmaRechazo) {
      // Cambiar status de la orden a "en_proceso" para que pueda resubir
      await this.prisma.ordenTrabajo.update({
        where: { id: evidencia.tarea.ordenTrabajoId },
        data: { status: 'en_proceso' },
      });
    } else {
      // Si no se confirma el rechazo, aprobar la evidencia
      await this.revisarEvidencia(
        evidenciaId,
        { status: 'aprobada' },
        'sistema', // jefeId temporal
      );
    }

    return evidenciaActualizada;
  }

  // ============================================
  // EVIDENCIAS - OBTENER DE UNA TAREA
  // ============================================
  async getEvidencias(tareaId: string) {
    const tarea = await this.getTarea(tareaId);

    return this.prisma.evidencia.findMany({
      where: { tareaId },
      orderBy: { intento: 'desc' },
    });
  }
  // ... código existente ...

  // ============================================
  // SOLICITUDES DE TAREA - CREAR
  // ============================================
  async solicitarTarea(solicitarDto: SolicitarTareaDto, empleadoId: string) {
    const orden = await this.findOne(solicitarDto.ordenTrabajoId);

    if (
      orden.status === 'completada' ||
      orden.status === 'aprobada' ||
      orden.status === 'cancelada'
    ) {
      throw new BadRequestException(
        'No se pueden solicitar tareas para esta orden',
      );
    }

    // Verificar que el empleado es quien tiene asignada la orden
    if (orden.empleadoId !== empleadoId) {
      throw new BadRequestException(
        'Solo el empleado asignado puede solicitar tareas adicionales',
      );
    }

    const solicitud = await this.prisma.solicitudTarea.create({
      data: {
        ordenTrabajoId: solicitarDto.ordenTrabajoId,
        empleadoId,
        descripcion: solicitarDto.descripcion,
        justificacion: solicitarDto.justificacion,
        status: 'pendiente',
      },
      include: {
        empleado: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        ordenTrabajo: {
          select: {
            titulo: true,
            kpi: {
              select: {
                indicador: true,
              },
            },
          },
        },
      },
    });

    try {
      await this.alertasService.alertaSolicitudTareaPendiente(
        solicitud,
        solicitud.ordenTrabajo,
      );
    } catch (error) {
      console.warn('Error al enviar alerta de solicitud tarea:', error.message);
    }

    return solicitud;
  }

  // ============================================
  // SOLICITUDES DE TAREA - LISTAR
  // ============================================
  async getSolicitudesTarea(filters?: {
    ordenTrabajoId?: string;
    empleadoId?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters?.ordenTrabajoId) where.ordenTrabajoId = filters.ordenTrabajoId;
    if (filters?.empleadoId) where.empleadoId = filters.empleadoId;
    if (filters?.status) where.status = filters.status;

    return this.prisma.solicitudTarea.findMany({
      where,
      include: {
        empleado: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        ordenTrabajo: {
          select: {
            titulo: true,
            kpi: {
              select: {
                indicador: true,
              },
            },
          },
        },
      },
      orderBy: { fechaSolicitud: 'desc' },
    });
  }

  // ============================================
  // SOLICITUDES DE TAREA - RESPONDER (JEFE)
  // ============================================
  async responderSolicitudTarea(
    solicitudId: string,
    responderDto: ResponderSolicitudTareaDto,
  ) {
    const solicitud = await this.prisma.solicitudTarea.findUnique({
      where: { id: solicitudId },
      include: {
        ordenTrabajo: true,
      },
    });

    if (!solicitud) {
      throw new NotFoundException(
        `Solicitud con ID ${solicitudId} no encontrada`,
      );
    }

    if (solicitud.status !== 'pendiente') {
      throw new BadRequestException('Esta solicitud ya fue respondida');
    }

    // Actualizar solicitud
    const solicitudActualizada = await this.prisma.solicitudTarea.update({
      where: { id: solicitudId },
      data: {
        status: responderDto.status,
        motivoRechazo: responderDto.motivoRechazo,
        fechaRespuesta: new Date(),
      },
    });

    if (responderDto.status === 'aprobada' && responderDto.nuevaFechaLimite) {
      await this.prisma.ordenTrabajo.update({
        where: { id: solicitud.ordenTrabajoId },
        data: { fechaLimite: new Date(responderDto.nuevaFechaLimite) },
      });
    }

    // Si fue aprobada, crear la tarea
    if (responderDto.status === 'aprobada') {
      const ultimaTarea = await this.prisma.tarea.findFirst({
        where: { ordenTrabajoId: solicitud.ordenTrabajoId },
        orderBy: { orden: 'desc' },
      });

      const nuevoOrden = ultimaTarea ? ultimaTarea.orden + 1 : 1;

      await this.crearTarea({
        ordenTrabajoId: solicitud.ordenTrabajoId,
        descripcion: solicitud.descripcion,
        orden: nuevoOrden,
        solicitudAgregar: true,
      });
    }

    // TODO: Generar alerta para el empleado

    return solicitudActualizada;
  }

  // ============================================
  // SOLICITUDES DE EDICIÓN - CREAR
  // ============================================
  async solicitarEdicion(
    solicitarDto: SolicitarEdicionDto,
    solicitanteId: string,
  ) {
    const orden = await this.findOne(solicitarDto.ordenTrabajoId);

    if (
      orden.status === 'completada' ||
      orden.status === 'aprobada' ||
      orden.status === 'cancelada'
    ) {
      throw new BadRequestException(
        'No se pueden solicitar ediciones para esta orden',
      );
    }

    // Obtener valor actual del campo
    let valorActual: string;
    switch (solicitarDto.campoAEditar) {
      case 'fechaLimite':
        valorActual = orden.fechaLimite.toISOString();
        break;
      case 'descripcion':
        valorActual = orden.descripcion;
        break;
      case 'cantidadTareas':
        valorActual = orden.cantidadTareas.toString();
        break;
      default:
        throw new BadRequestException('Campo no válido para edición');
    }

    const solicitud = await this.prisma.solicitudEdicion.create({
      data: {
        ordenTrabajoId: solicitarDto.ordenTrabajoId,
        solicitanteId,
        campoAEditar: solicitarDto.campoAEditar,
        valorActual,
        valorNuevo: solicitarDto.valorNuevo,
        justificacion: solicitarDto.justificacion,
        status: 'pendiente',
      },
      include: {
        solicitante: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        ordenTrabajo: {
          select: {
            titulo: true,
            kpi: {
              select: {
                indicador: true,
              },
            },
          },
        },
      },
    });

    // Marcar orden como requiere aprobación
    await this.update(solicitarDto.ordenTrabajoId, {
      requiereAprobacion: true,
    });

    await this.alertasService.alertaSolicitudEdicionPendiente(solicitud, orden);

    return solicitud;
  }

  // ============================================
  // SOLICITUDES DE EDICIÓN - LISTAR
  // ============================================
  async getSolicitudesEdicion(filters?: {
    ordenTrabajoId?: string;
    solicitanteId?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters?.ordenTrabajoId) where.ordenTrabajoId = filters.ordenTrabajoId;
    if (filters?.solicitanteId) where.solicitanteId = filters.solicitanteId;
    if (filters?.status) where.status = filters.status;

    return this.prisma.solicitudEdicion.findMany({
      where,
      include: {
        solicitante: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        ordenTrabajo: {
          select: {
            titulo: true,
            kpi: {
              select: {
                indicador: true,
              },
            },
          },
        },
      },
      orderBy: { fechaSolicitud: 'desc' },
    });
  }

  // ============================================
  // SOLICITUDES DE EDICIÓN - RESPONDER (JEFE)
  // ============================================
  async responderSolicitudEdicion(
    solicitudId: string,
    responderDto: ResponderSolicitudEdicionDto,
  ) {
    const solicitud = await this.prisma.solicitudEdicion.findUnique({
      where: { id: solicitudId },
    });

    if (!solicitud) {
      throw new NotFoundException(
        `Solicitud con ID ${solicitudId} no encontrada`,
      );
    }

    if (solicitud.status !== 'pendiente') {
      throw new BadRequestException('Esta solicitud ya fue respondida');
    }

    // Actualizar solicitud
    const solicitudActualizada = await this.prisma.solicitudEdicion.update({
      where: { id: solicitudId },
      data: {
        status: responderDto.status,
        motivoRechazo: responderDto.motivoRechazo,
        fechaRespuesta: new Date(),
      },
    });

    // Si fue aprobada, aplicar el cambio
    if (responderDto.status === 'aprobada') {
      const updateData: any = {};

      switch (solicitud.campoAEditar) {
        case 'fechaLimite':
          updateData.fechaLimite = new Date(solicitud.valorNuevo);
          break;
        case 'descripcion':
          updateData.descripcion = solicitud.valorNuevo;
          break;
        case 'cantidadTareas':
          updateData.cantidadTareas = parseInt(solicitud.valorNuevo);
          break;
      }

      await this.update(solicitud.ordenTrabajoId, updateData);
    }

    // Desmarcar requiereAprobacion si no hay más solicitudes pendientes
    const solicitudesPendientes = await this.prisma.solicitudEdicion.count({
      where: {
        ordenTrabajoId: solicitud.ordenTrabajoId,
        status: 'pendiente',
      },
    });

    if (solicitudesPendientes === 0) {
      await this.update(solicitud.ordenTrabajoId, {
        requiereAprobacion: false,
      });
    }

    // TODO: Generar alerta para el solicitante

    return solicitudActualizada;
  }
}
