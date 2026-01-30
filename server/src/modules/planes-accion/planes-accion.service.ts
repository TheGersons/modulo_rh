import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreatePlanAccionDto } from './dto/create-plan-accion.dto';
import { UpdatePlanAccionDto } from './dto/update-plan-accion.dto';
import { AprobarPlanDto } from './dto/aprobar-plan.dto';
import { RechazarPlanDto } from './dto/recharzar-plan.dto';

@Injectable()
export class PlanesAccionService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // CREAR PLAN DE ACCIÓN
  // ============================================
  async create(createPlanAccionDto: CreatePlanAccionDto) {
    // Validar que la evaluación existe
    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id: createPlanAccionDto.evaluacionId },
    });

    if (!evaluacion) {
      throw new NotFoundException(`No se encontró la evaluación con ID ${createPlanAccionDto.evaluacionId}`);
    }

    // Validar que el empleado existe
    const empleado = await this.prisma.user.findUnique({
      where: { id: createPlanAccionDto.empleadoId },
    });

    if (!empleado) {
      throw new NotFoundException(`No se encontró el empleado con ID ${createPlanAccionDto.empleadoId}`);
    }

    // Validar que el KPI existe
    const kpi = await this.prisma.kPI.findUnique({
      where: { id: createPlanAccionDto.kpiId },
    });

    if (!kpi) {
      throw new NotFoundException(`No se encontró el KPI con ID ${createPlanAccionDto.kpiId}`);
    }

    // Verificar que no exista ya un plan para este KPI en esta evaluación
    const planExistente = await this.prisma.planAccion.findFirst({
      where: {
        evaluacionId: createPlanAccionDto.evaluacionId,
        kpiId: createPlanAccionDto.kpiId,
      },
    });

    if (planExistente) {
      throw new BadRequestException('Ya existe un plan de acción para este KPI en esta evaluación');
    }

    const plan = await this.prisma.planAccion.create({
      data: {
        evaluacionId: createPlanAccionDto.evaluacionId,
        empleadoId: createPlanAccionDto.empleadoId,
        kpiId: createPlanAccionDto.kpiId,
        descripcionProblema: createPlanAccionDto.descripcionProblema || '',
        accionesCorrectivas: createPlanAccionDto.accionesCorrectivas || '',
        recursosNecesarios: createPlanAccionDto.recursosNecesarios || '',
        metasEspecificas: createPlanAccionDto.metasEspecificas || '',
        diasPlazo: createPlanAccionDto.diasPlazo || 15,
        status: 'borrador',
      },
      include: {
        evaluacion: {
          select: {
            periodo: true,
            anio: true,
          },
        },
        empleado: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        kpi: {
          select: {
            key: true,
            indicador: true,
          },
        },
      },
    });

    return plan;
  }

  // ============================================
  // CREAR PLANES AUTOMÁTICAMENTE PARA KPIs ROJOS
  // ============================================
  async crearPlanesAutomaticos(evaluacionId: string) {
    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id: evaluacionId },
      include: {
        detalles: {
          where: { estado: 'rojo' },
          include: { kpi: true },
        },
      },
    });

    if (!evaluacion) {
      throw new NotFoundException(`No se encontró la evaluación con ID ${evaluacionId}`);
    }

    const planesCreados: any[] = [];

    for (const detalle of evaluacion.detalles) {
      // Verificar que no exista ya un plan
      const planExistente = await this.prisma.planAccion.findFirst({
        where: {
          evaluacionId,
          kpiId: detalle.kpiId,
        },
      });

      if (!planExistente) {
        const plan = await this.create({
          evaluacionId,
          empleadoId: evaluacion.empleadoId,
          kpiId: detalle.kpiId,
          descripcionProblema: `KPI en estado rojo: ${detalle.kpi.indicador}. Resultado obtenido: ${detalle.resultadoNumerico}, Meta: ${detalle.meta}`,
        });

        planesCreados.push(plan);
      }
    }

    return {
      mensaje: `Se crearon ${planesCreados.length} plan(es) de acción automáticamente`,
      planes: planesCreados,
    };
  }

  // ============================================
  // LISTAR PLANES
  // ============================================
  async findAll(filters?: { empleadoId?: string; status?: string; evaluacionId?: string }) {
    const where: any = {};

    if (filters?.empleadoId) where.empleadoId = filters.empleadoId;
    if (filters?.status) where.status = filters.status;
    if (filters?.evaluacionId) where.evaluacionId = filters.evaluacionId;

    const planes = await this.prisma.planAccion.findMany({
      where,
      include: {
        evaluacion: {
          select: {
            id: true,
            periodo: true,
            anio: true,
          },
        },
        empleado: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        kpi: {
          select: {
            id: true,
            key: true,
            indicador: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return planes;
  }

  // ============================================
  // OBTENER PLAN POR ID
  // ============================================
  async findOne(id: string) {
    const plan = await this.prisma.planAccion.findUnique({
      where: { id },
      include: {
        evaluacion: {
          select: {
            id: true,
            periodo: true,
            anio: true,
            promedioGeneral: true,
          },
        },
        empleado: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            puesto: true,
            area: {
              select: {
                nombre: true,
              },
            },
          },
        },
        kpi: {
          select: {
            id: true,
            key: true,
            indicador: true,
            meta: true,
            unidad: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`No se encontró el plan de acción con ID ${id}`);
    }

    return plan;
  }

  // ============================================
  // OBTENER PLANES POR EMPLEADO
  // ============================================
  async findByEmpleado(empleadoId: string) {
    const empleado = await this.prisma.user.findUnique({
      where: { id: empleadoId },
    });

    if (!empleado) {
      throw new NotFoundException(`No se encontró el empleado con ID ${empleadoId}`);
    }

    return this.findAll({ empleadoId });
  }

  // ============================================
  // OBTENER PLANES POR EVALUACIÓN
  // ============================================
  async findByEvaluacion(evaluacionId: string) {
    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id: evaluacionId },
    });

    if (!evaluacion) {
      throw new NotFoundException(`No se encontró la evaluación con ID ${evaluacionId}`);
    }

    return this.findAll({ evaluacionId });
  }

  // ============================================
  // OBTENER PLANES PENDIENTES DE ENVÍO (>3 días)
  // ============================================
  async findPendientesEnvio() {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 3);

    const planes = await this.prisma.planAccion.findMany({
      where: {
        status: 'borrador',
        fechaCreacion: {
          lte: fechaLimite,
        },
      },
      include: {
        empleado: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        kpi: {
          select: {
            indicador: true,
          },
        },
      },
    });

    return planes;
  }

  // ============================================
  // OBTENER PLANES VENCIDOS
  // ============================================
  async findVencidos() {
    const planes = await this.prisma.planAccion.findMany({
      where: {
        status: 'en_progreso',
        fechaLimite: {
          lt: new Date(),
        },
      },
      include: {
        empleado: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        kpi: {
          select: {
            indicador: true,
          },
        },
      },
    });

    return planes;
  }

  // ============================================
  // ACTUALIZAR PLAN (solo en borrador)
  // ============================================
  async update(id: string, updatePlanAccionDto: UpdatePlanAccionDto) {
    const plan = await this.findOne(id);

    if (plan.status !== 'borrador') {
      throw new BadRequestException('Solo se pueden editar planes en estado borrador');
    }

    const planActualizado = await this.prisma.planAccion.update({
      where: { id },
      data: updatePlanAccionDto,
      include: {
        evaluacion: {
          select: {
            periodo: true,
            anio: true,
          },
        },
        empleado: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        kpi: {
          select: {
            key: true,
            indicador: true,
          },
        },
      },
    });

    return planActualizado;
  }

  // ============================================
  // ENVIAR PLAN PARA REVISIÓN
  // ============================================
  async enviar(id: string) {
    const plan = await this.findOne(id);

    if (plan.status !== 'borrador') {
      throw new BadRequestException('Solo se pueden enviar planes en estado borrador');
    }

    // Validar que tenga contenido mínimo
    if (!plan.descripcionProblema || !plan.accionesCorrectivas || !plan.metasEspecificas) {
      throw new BadRequestException(
        'El plan debe incluir: descripción del problema, acciones correctivas y metas específicas',
      );
    }

    const planEnviado = await this.prisma.planAccion.update({
      where: { id },
      data: {
        status: 'enviado',
        fechaEnvio: new Date(),
      },
    });

    console.log(`📧 Plan de acción enviado para revisión: ${plan.kpi.indicador}`);

    return planEnviado;
  }

  // ============================================
  // APROBAR PLAN (JEFE)
  // ============================================
  async aprobar(id: string, aprobarPlanDto: AprobarPlanDto) {
    const plan = await this.findOne(id);

    if (plan.status !== 'enviado') {
      throw new BadRequestException('Solo se pueden aprobar planes en estado enviado');
    }

    const diasPlazo = aprobarPlanDto.diasPlazo || plan.diasPlazo;
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasPlazo);

    const planAprobado = await this.prisma.planAccion.update({
      where: { id },
      data: {
        status: 'aprobado',
        diasPlazo,
        fechaLimite,
        fechaRevision: new Date(),
        fechaAprobacion: new Date(),
      },
    });

    // Cambiar a "en_progreso" automáticamente
    await this.prisma.planAccion.update({
      where: { id },
      data: { status: 'en_progreso' },
    });

    console.log(`✅ Plan aprobado con plazo de ${diasPlazo} días`);

    return planAprobado;
  }

  // ============================================
  // RECHAZAR PLAN (JEFE)
  // ============================================
  async rechazar(id: string, rechazarPlanDto: RechazarPlanDto) {
    const plan = await this.findOne(id);

    if (plan.status !== 'enviado') {
      throw new BadRequestException('Solo se pueden rechazar planes en estado enviado');
    }

    const planRechazado = await this.prisma.planAccion.update({
      where: { id },
      data: {
        status: 'rechazado',
        motivoRechazo: rechazarPlanDto.motivoRechazo,
        fechaRevision: new Date(),
      },
    });

    // Volver a borrador para que el empleado lo rehagas
    await this.prisma.planAccion.update({
      where: { id },
      data: { status: 'borrador' },
    });

    console.log(`❌ Plan rechazado: ${rechazarPlanDto.motivoRechazo}`);

    return planRechazado;
  }

  // ============================================
  // COMPLETAR PLAN
  // ============================================
  async completar(id: string) {
    const plan = await this.findOne(id);

    if (plan.status !== 'en_progreso') {
      throw new BadRequestException('Solo se pueden completar planes en progreso');
    }

    const planCompletado = await this.prisma.planAccion.update({
      where: { id },
      data: {
        status: 'completado',
        fechaCompletado: new Date(),
      },
    });

    console.log(`✅ Plan completado exitosamente`);

    return planCompletado;
  }

  // ============================================
  // ELIMINAR PLAN
  // ============================================
  async remove(id: string) {
    const plan = await this.findOne(id);

    if (plan.status !== 'borrador') {
      throw new BadRequestException('Solo se pueden eliminar planes en borrador');
    }

    await this.prisma.planAccion.delete({
      where: { id },
    });

    return { message: 'Plan de acción eliminado exitosamente' };
  }
}