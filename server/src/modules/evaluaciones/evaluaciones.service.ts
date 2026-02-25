import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';

@Injectable()
export class EvaluacionesService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // CREAR EVALUACIÓN (BORRADOR)
  // ============================================
  async create(createEvaluacionDto: CreateEvaluacionDto) {
    // Validar que el empleado exista
    const empleado = await this.prisma.user.findUnique({
      where: { id: createEvaluacionDto.empleadoId },
      include: { area: true },
    });

    if (!empleado) {
      throw new NotFoundException(
        `No se encontró el empleado con ID ${createEvaluacionDto.empleadoId}`,
      );
    }

    // Validar que el evaluador exista
    const evaluador = await this.prisma.user.findUnique({
      where: { id: createEvaluacionDto.evaluadorId },
    });

    if (!evaluador) {
      throw new NotFoundException(
        `No se encontró el evaluador con ID ${createEvaluacionDto.evaluadorId}`,
      );
    }

    // Verificar si ya existe una evaluación para este empleado en el mismo periodo
    const evaluacionExistente = await this.prisma.evaluacion.findFirst({
      where: {
        empleadoId: createEvaluacionDto.empleadoId,
        periodo: createEvaluacionDto.periodo,
        anio: createEvaluacionDto.anio,
      },
    });

    if (evaluacionExistente) {
      throw new BadRequestException(
        `Ya existe una evaluación para este empleado en ${createEvaluacionDto.periodo} ${createEvaluacionDto.anio}`,
      );
    }

    // Crear evaluación en estado borrador
    const evaluacion = await this.prisma.evaluacion.create({
      data: {
        empleadoId: createEvaluacionDto.empleadoId,
        evaluadorId: createEvaluacionDto.evaluadorId,
        periodo: createEvaluacionDto.periodo,
        tipoPeriodo: createEvaluacionDto.tipoPeriodo,
        anio: createEvaluacionDto.anio,
        status: 'borrador',
        promedioGeneral: 0,
        kpisRojos: 0,
        porcentajeRojos: 0,
      },
      include: {
        empleado: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            puesto: true,
            area: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        evaluador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    // Si se proporcionan detalles, crearlos
    if (
      createEvaluacionDto.detalles &&
      createEvaluacionDto.detalles.length > 0
    ) {
      await this.agregarDetalles(evaluacion.id, createEvaluacionDto.detalles);
      return this.findOne(evaluacion.id);
    }

    return evaluacion;
  }

  // ============================================
  // LISTAR EVALUACIONES
  // ============================================
  async findAll(filters?: {
    empleadoId?: string;
    evaluadorId?: string;
    areaId?: string;
    periodo?: string;
    anio?: number;
    status?: string;
  }) {
    const where: any = {};

    if (filters?.empleadoId) {
      where.empleadoId = filters.empleadoId;
    }

    if (filters?.evaluadorId) {
      where.evaluadorId = filters.evaluadorId;
    }

    if (filters?.areaId) {
      where.empleado = {
        areaId: filters.areaId,
      };
    }

    if (filters?.periodo) {
      where.periodo = filters.periodo;
    }

    if (filters?.anio) {
      where.anio = filters.anio;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const evaluaciones = await this.prisma.evaluacion.findMany({
      where,
      include: {
        empleado: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            puesto: true,
            area: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        evaluador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        _count: {
          select: {
            detalles: true,
          },
        },
      },
      orderBy: [{ anio: 'desc' }, { createdAt: 'desc' }],
    });

    return evaluaciones;
  }

  // ============================================
  // OBTENER UNA EVALUACIÓN POR ID
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
            puesto: true,
            area: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        evaluador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            puesto: true,
          },
        },
        detalles: {
          include: {
            kpi: true,
          },
          orderBy: {
            kpi: {
              orden: 'asc',
            },
          },
        },
      },
    });

    if (!evaluacion) {
      throw new NotFoundException(`No se encontró la evaluación con ID ${id}`);
    }

    return evaluacion;
  }

  // ============================================
  // ACTUALIZAR EVALUACIÓN
  // ============================================
  async update(id: string, updateEvaluacionDto: UpdateEvaluacionDto) {
    // Verificar que la evaluación existe
    const evaluacionExistente = await this.findOne(id);

    // Solo se puede editar si está en borrador
    if (evaluacionExistente.status !== 'borrador') {
      throw new BadRequestException(
        'Solo se pueden editar evaluaciones en estado borrador',
      );
    }

    // Actualizar evaluación
    const evaluacion = await this.prisma.evaluacion.update({
      where: { id },
      data: {
        periodo: updateEvaluacionDto.periodo,
        anio: updateEvaluacionDto.anio,
      },
    });

    // Si se proporcionan detalles, actualizarlos
    if (
      updateEvaluacionDto.detalles &&
      updateEvaluacionDto.detalles.length > 0
    ) {
      // Eliminar detalles existentes
      await this.prisma.evaluacionDetalle.deleteMany({
        where: { evaluacionId: id },
      });

      // Crear nuevos detalles
      await this.agregarDetalles(id, updateEvaluacionDto.detalles);

      // Recalcular métricas
      await this.recalcularMetricas(id);
    }

    return this.findOne(id);
  }

  // ============================================
  // AGREGAR/ACTUALIZAR DETALLES
  // ============================================
  private async agregarDetalles(evaluacionId: string, detalles: any[]) {
    for (const detalle of detalles) {
      // Obtener el KPI
      const kpi = await this.prisma.kPI.findUnique({
        where: { id: detalle.kpiId },
      });

      if (!kpi) {
        throw new NotFoundException(
          `No se encontró el KPI con ID ${detalle.kpiId}`,
        );
      }

      // Calcular métricas del detalle
      const metricas = this.calcularMetricasDetalle(
        kpi,
        detalle.resultadoNumerico,
      );

      // Crear o actualizar detalle
      if (detalle.id) {
        await this.prisma.evaluacionDetalle.update({
          where: { id: detalle.id },
          data: {
            resultadoNumerico: detalle.resultadoNumerico,
            resultadoPorcentaje: metricas.resultadoPorcentaje,
            brechaVsMeta: metricas.brechaVsMeta,
            estado: metricas.estado,
          },
        });
      } else {
        await this.prisma.evaluacionDetalle.create({
          data: {
            evaluacionId,
            kpiId: detalle.kpiId,
            resultadoNumerico: detalle.resultadoNumerico,
            meta: kpi.meta,
            umbralAmarillo: kpi.umbralAmarillo!,
            resultadoPorcentaje: metricas.resultadoPorcentaje,
            brechaVsMeta: metricas.brechaVsMeta,
            estado: metricas.estado,
          },
        });
      }
    }
  }

  // ============================================
  // CALCULAR MÉTRICAS DE UN DETALLE
  // ============================================
  private calcularMetricasDetalle(kpi: any, resultadoNumerico: number) {
    let resultadoPorcentaje = 0;
    let brechaVsMeta = 0;
    let estado: 'verde' | 'amarillo' | 'rojo' = 'rojo';

    if (kpi.sentido === 'Mayor es mejor') {
      // Para KPIs donde mayor es mejor
      const porcentajeSinLimite = (resultadoNumerico / kpi.meta) * 100;
      resultadoPorcentaje = Math.min(porcentajeSinLimite, 100);
      brechaVsMeta = resultadoNumerico - kpi.meta;

      if (resultadoNumerico >= kpi.meta) {
        estado = 'verde';
      } else if (resultadoNumerico >= kpi.umbralAmarillo) {
        estado = 'amarillo';
      } else {
        estado = 'rojo';
      }
    } else {
      // Para KPIs donde menor es mejor
      const porcentajeSinLimite = (kpi.meta / resultadoNumerico) * 100;
      resultadoPorcentaje = Math.min(porcentajeSinLimite, 100);
      brechaVsMeta = kpi.meta - resultadoNumerico;

      if (resultadoNumerico <= kpi.meta) {
        estado = 'verde';
      } else if (resultadoNumerico <= kpi.umbralAmarillo) {
        estado = 'amarillo';
      } else {
        estado = 'rojo';
      }
    }

    return {
      resultadoPorcentaje: Math.round(resultadoPorcentaje * 100) / 100,
      brechaVsMeta: Math.round(brechaVsMeta * 100) / 100,
      estado,
    };
  }

  // ============================================
  // RECALCULAR MÉTRICAS DE LA EVALUACIÓN
  // ============================================
  async recalcularMetricas(id: string) {
    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id },
      include: { detalles: true },
    });

    if (!evaluacion || evaluacion.detalles.length === 0) {
      return;
    }

    // Calcular promedio general
    const sumaPromedios = evaluacion.detalles.reduce(
      (acc, d) => acc + d.resultadoPorcentaje!,
      0,
    );
    const promedioGeneral = sumaPromedios / evaluacion.detalles.length;

    // Contar KPIs rojos
    const kpisRojos = evaluacion.detalles.filter(
      (d) => d.estado === 'rojo',
    ).length;
    const porcentajeRojos = (kpisRojos / evaluacion.detalles.length) * 100;

    // Actualizar evaluación
    await this.prisma.evaluacion.update({
      where: { id },
      data: {
        promedioGeneral: Math.round(promedioGeneral * 100) / 100,
        kpisRojos,
        porcentajeRojos: Math.round(porcentajeRojos * 100) / 100,
      },
    });
  }

  // ============================================
  // ENVIAR EVALUACIÓN
  // ============================================
  async enviar(id: string) {
    const evaluacion = await this.findOne(id);

    // Validar que esté en borrador
    if (evaluacion.status !== 'borrador') {
      throw new BadRequestException(
        'Solo se pueden enviar evaluaciones en estado borrador',
      );
    }

    // Recalcular métricas antes de enviar
    await this.recalcularMetricas(id);

    // Actualizar status y fecha de envío
    const evaluacionEnviada = await this.prisma.evaluacion.update({
      where: { id },
      data: {
        status: 'enviada',
      },
      include: {
        empleado: true,
        evaluador: true,
      },
    });

    // TODO: Crear notificación para el empleado
    // await this.crearNotificacion(evaluacionEnviada.empleadoId, ...)

    return this.findOne(id);
  }

  // ============================================
  // ELIMINAR EVALUACIÓN
  // ============================================
  async remove(id: string) {
    const evaluacion = await this.findOne(id);

    // Solo se pueden eliminar borradores
    if (evaluacion.status !== 'borrador') {
      throw new BadRequestException(
        'Solo se pueden eliminar evaluaciones en estado borrador',
      );
    }

    // Eliminar detalles primero
    await this.prisma.evaluacionDetalle.deleteMany({
      where: { evaluacionId: id },
    });

    // Eliminar evaluación
    await this.prisma.evaluacion.delete({
      where: { id },
    });

    return { message: 'Evaluación eliminada exitosamente' };
  }

  // ============================================
  // OBTENER EVALUACIONES POR EMPLEADO
  // ============================================
  async findByEmpleado(empleadoId: string) {
    const empleado = await this.prisma.user.findUnique({
      where: { id: empleadoId },
    });

    if (!empleado) {
      throw new NotFoundException(
        `No se encontró el empleado con ID ${empleadoId}`,
      );
    }

    return this.findAll({ empleadoId });
  }

  // ============================================
  // OBTENER EVALUACIONES POR EVALUADOR
  // ============================================
  async findByEvaluador(evaluadorId: string) {
    const evaluador = await this.prisma.user.findUnique({
      where: { id: evaluadorId },
    });

    if (!evaluador) {
      throw new NotFoundException(
        `No se encontró el evaluador con ID ${evaluadorId}`,
      );
    }

    return this.findAll({ evaluadorId });
  }

  // ============================================
  // OBTENER EVALUACIONES POR ÁREA
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
  // OBTENER EVALUACIONES POR PERIODO
  // ============================================
  async findByPeriodo(periodo: string, anio: number) {
    return this.findAll({ periodo, anio });
  }
}
