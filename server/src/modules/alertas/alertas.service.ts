import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';

@Injectable()
export class AlertasService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // CREAR ALERTA MANUALMENTE
  // ============================================
async create(createAlertaDto: CreateAlertaDto) {
  const alerta = await this.prisma.alerta.create({
    data: {
      tipo: createAlertaDto.tipo,
      nivel: createAlertaDto.nivel,
      titulo: createAlertaDto.titulo,
      descripcion: createAlertaDto.descripcion,
      areaId: createAlertaDto.areaId,
      empleadoId: createAlertaDto.empleadoId,
      evaluacionId: createAlertaDto.evaluacionId,
      accionSugerida: createAlertaDto.accionSugerida,
      responsable: createAlertaDto.responsable,
      status: 'activa',
    },
    include: {
      area: {
        select: {
          id: true,
          nombre: true,
        },
      },
      empleado: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
        },
      },
      evaluacion: {
        select: {
          id: true,
          periodo: true,
          anio: true,
        },
      },
    },
  });

  return alerta;
}

  // ============================================
  // GENERAR ALERTAS AUTOMÁTICAS
  // ============================================
  async generarAlertasAutomaticas() {
    const alertasGeneradas: any[] = [];

    // 1. Alertas por KPIs críticos (rojos)
    const evaluacionesConKpisRojos = await this.prisma.evaluacion.findMany({
      where: {
        status: { in: ['enviada', 'validada'] },
        kpisRojos: { gt: 0 },
      },
      include: {
        empleado: {
          include: {
            area: true,
          },
        },
        detalles: {
          where: {
            estado: 'rojo',
          },
          include: {
            kpi: true,
          },
        },
      },
    });

    for (const evaluacion of evaluacionesConKpisRojos) {
      // Verificar si ya existe una alerta para esta evaluación
      const alertaExistente = await this.prisma.alerta.findFirst({
        where: {
          tipo: 'kpi_critico',
          evaluacionId: evaluacion.id,
          status: { in: ['pendiente', 'en_proceso'] },
        },
      });

      if (!alertaExistente && evaluacion.detalles.length > 0) {
        const kpisRojosNombres = evaluacion.detalles.map(d => d.kpi.indicador).join(', ');

        const alerta = await this.create({
          tipo: 'kpi_critico',
          nivel: evaluacion.kpisRojos >= 3 ? 'ALTO' : evaluacion.kpisRojos >= 2 ? 'MEDIO' : 'BAJO',
          titulo: `${evaluacion.kpisRojos} KPI(s) en estado crítico`,
          descripcion: `El empleado ${evaluacion.empleado.nombre} ${evaluacion.empleado.apellido} tiene ${evaluacion.kpisRojos} KPI(s) en rojo: ${kpisRojosNombres}`,
          areaId: evaluacion.empleado.areaId ? evaluacion.empleado.areaId : 'Sin definir',
          empleadoId: evaluacion.empleadoId,
          evaluacionId: evaluacion.id,
          accionSugerida: 'Revisar plan de acción con el empleado y establecer metas de mejora',
        });

        alertasGeneradas.push(alerta);
      }
    }

    // 2. Alertas por áreas en riesgo ALTO
    const areasRiesgoAlto = await this.prisma.area.findMany({
      where: {
        activa: true,
        nivelRiesgo: 'ALTO',
      },
      include: {
        jefe: true,
      },
    });

    for (const area of areasRiesgoAlto) {
      // Verificar si ya existe una alerta activa para esta área
      const alertaExistente = await this.prisma.alerta.findFirst({
        where: {
          tipo: 'area_riesgo',
          areaId: area.id,
          status: { in: ['pendiente', 'en_proceso'] },
        },
      });

      if (!alertaExistente) {
        const alerta = await this.create({
          tipo: 'area_riesgo',
          nivel: 'ALTO',
          titulo: `Área en riesgo alto: ${area.nombre}`,
          descripcion: `El área ${area.nombre} tiene ${area.porcentajeRojos}% de KPIs en rojo (${area.kpisRojos}/${area.totalKpis})`,
          areaId: area.id,
          accionSugerida: `Reunión urgente con ${area.jefe?.nombre} ${area.jefe?.apellido} para plan de recuperación`,
        });

        alertasGeneradas.push(alerta);
      }
    }

    // 3. Alertas por evaluaciones pendientes (más de 7 días)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 7);

    const evaluacionesPendientes = await this.prisma.evaluacion.findMany({
      where: {
        status: 'borrador',
        createdAt: {
          lte: fechaLimite,
        },
      },
      include: {
        empleado: {
          include: {
            area: true,
          },
        },
        evaluador: true,
      },
    });

    for (const evaluacion of evaluacionesPendientes) {
      const alertaExistente = await this.prisma.alerta.findFirst({
        where: {
          tipo: 'evaluacion_pendiente',
          evaluacionId: evaluacion.id,
          status: { in: ['pendiente', 'en_proceso'] },
        },
      });

      if (!alertaExistente) {
        const diasPendiente = Math.floor(
          (new Date().getTime() - new Date(evaluacion.createdAt).getTime()) / (1000 * 60 * 60 * 24),
        );

        const alerta = await this.create({
          tipo: 'evaluacion_pendiente',
          nivel: diasPendiente > 14 ? 'ALTO' : 'MEDIO',
          titulo: `Evaluación pendiente hace ${diasPendiente} días`,
          descripcion: `La evaluación de ${evaluacion.empleado.nombre} ${evaluacion.empleado.apellido} está en borrador desde hace ${diasPendiente} días`,
          areaId: evaluacion.empleado.areaId ? evaluacion.empleado.areaId : 'Sin definir',
          empleadoId: evaluacion.empleadoId,
          evaluacionId: evaluacion.id,
          accionSugerida: `Contactar a ${evaluacion.evaluador.nombre} ${evaluacion.evaluador.apellido} para completar la evaluación`,
        });

        alertasGeneradas.push(alerta);
      }
    }

    // 4. Alertas por revisiones solicitadas sin respuesta (más de 3 días)
    const fechaLimiteRevision = new Date();
    fechaLimiteRevision.setDate(fechaLimiteRevision.getDate() - 3);

    const revisionesPendientes = await this.prisma.validacion.findMany({
      where: {
        status: 'revision_solicitada',
        respuestaJefe: null,
        createdAt: {
          lte: fechaLimiteRevision,
        },
      },
      include: {
        evaluacion: {
          include: {
            empleado: {
              include: {
                area: true,
              },
            },
            evaluador: true,
          },
        },
      },
    });

    for (const revision of revisionesPendientes) {
      const alertaExistente = await this.prisma.alerta.findFirst({
        where: {
          tipo: 'revision_solicitada',
          evaluacionId: revision.evaluacionId,
          status: { in: ['pendiente', 'en_proceso'] },
        },
      });

      if (!alertaExistente) {
        const diasPendiente = Math.floor(
          (new Date().getTime() - new Date(revision.createdAt).getTime()) / (1000 * 60 * 60 * 24),
        );

        const alerta = await this.create({
          tipo: 'revision_solicitada',
          nivel: diasPendiente > 7 ? 'ALTO' : 'MEDIO',
          titulo: `Revisión sin respuesta hace ${diasPendiente} días`,
          descripcion: `${revision.evaluacion.empleado.nombre} ${revision.evaluacion.empleado.apellido} solicitó revisión de su evaluación hace ${diasPendiente} días sin recibir respuesta`,
          areaId: revision.evaluacion.empleado.areaId ? revision.evaluacion.empleado.areaId : 'Sin definir',
          empleadoId: revision.empleadoId,
          evaluacionId: revision.evaluacionId,
          accionSugerida: `Recordar a ${revision.evaluacion.evaluador.nombre} ${revision.evaluacion.evaluador.apellido} que responda la solicitud de revisión`,
        });

        alertasGeneradas.push(alerta);
      }
    }

    return {
      mensaje: `Se generaron ${alertasGeneradas.length} nueva(s) alerta(s)`,
      alertas: alertasGeneradas,
    };
  }

  // ============================================
  // LISTAR ALERTAS
  // ============================================
  async findAll(filters?: {
    tipo?: string;
    nivel?: string;
    status?: string;
    areaId?: string;
    activas?: boolean;
  }) {
    const where: any = {};

    if (filters?.tipo) {
      where.tipo = filters.tipo;
    }

    if (filters?.nivel) {
      where.nivel = filters.nivel;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.areaId) {
      where.areaId = filters.areaId;
    }

    if (filters?.activas) {
      where.status = { in: ['pendiente', 'en_proceso'] };
    }

    const alertas = await this.prisma.alerta.findMany({
      where,
      include: {
        area: {
          select: {
            id: true,
            nombre: true,
          },
        },
        empleado: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: [{ nivel: 'desc' }, { createdAt: 'desc' }],
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
            id: true,
            nombre: true,
          },
        },
        empleado: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            puesto: true,
          },
        },
        evaluacion: {
          select: {
            id: true,
            periodo: true,
            anio: true,
            promedioGeneral: true,
          },
        },
      },
    });

    if (!alerta) {
      throw new NotFoundException(`No se encontró la alerta con ID ${id}`);
    }

    return alerta;
  }

  // ============================================
  // ACTUALIZAR ALERTA
  // ============================================
  async update(id: string, updateAlertaDto: UpdateAlertaDto) {
    await this.findOne(id);

    const alerta = await this.prisma.alerta.update({
      where: { id },
      data: updateAlertaDto,
      include: {
        area: {
          select: {
            id: true,
            nombre: true,
          },
        },
        empleado: {
          select: {
            id: true,
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
  async resolver(id: string, accionTomada: string, responsableId?: string) {
    const alerta = await this.update(id, {
      status: 'resuelta',
      accionTomada,
      responsableId,
    });

    return alerta;
  }

  // ============================================
  // DESCARTAR ALERTA
  // ============================================
  async descartar(id: string, motivo: string) {
    const alerta = await this.update(id, {
      status: 'descartada',
      accionTomada: `Descartada: ${motivo}`,
    });

    return alerta;
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
  // OBTENER ALERTAS ACTIVAS
  // ============================================
  async findActivas() {
    return this.findAll({ status: 'activa' });
  }

  // ============================================
  // OBTENER ALERTAS POR ÁREA
  // ============================================
  async findByArea(areaId: string) {
    const area = await this.prisma.area.findUnique({
      where: { id: areaId },
    });

    if (!area) {
      throw new NotFoundException(`No se encontró el área con ID ${areaId}`);
    }

    return this.findAll({ areaId });
  }

  // ============================================
  // ESTADÍSTICAS DE ALERTAS
  // ============================================
  async getEstadisticas() {
    const total = await this.prisma.alerta.count();
    const pendientes = await this.prisma.alerta.count({ where: { status: 'pendiente' } });
    const enProceso = await this.prisma.alerta.count({ where: { status: 'en_proceso' } });
    const resueltas = await this.prisma.alerta.count({ where: { status: 'resuelta' } });
    const descartadas = await this.prisma.alerta.count({ where: { status: 'descartada' } });

    const porNivel = await this.prisma.alerta.groupBy({
      by: ['nivel'],
      _count: true,
      where: {
        status: { in: ['pendiente', 'en_proceso'] },
      },
    });

    const porTipo = await this.prisma.alerta.groupBy({
      by: ['tipo'],
      _count: true,
      where: {
        status: { in: ['pendiente', 'en_proceso'] },
      },
    });

    return {
      total,
      porEstado: {
        pendientes,
        enProceso,
        resueltas,
        descartadas,
      },
      porNivel: porNivel.map(n => ({
        nivel: n.nivel,
        cantidad: n._count,
      })),
      porTipo: porTipo.map(t => ({
        tipo: t.tipo,
        cantidad: t._count,
      })),
    };
  }
}