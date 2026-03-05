import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { UpdateKpiDto } from './dto/update-kpi.dto';

@Injectable()
export class KpisService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // CREAR KPI
  // ============================================
  async create(createKpiDto: CreateKpiDto) {
    // Validar que el área existe
    const area = await this.prisma.area.findUnique({
      where: { id: createKpiDto.areaId },
    });

    if (!area) {
      throw new NotFoundException(
        `Área con ID ${createKpiDto.areaId} no encontrada`,
      );
    }

    // Validar puesto si se especifica
    if (createKpiDto.puestoId) {
      const puesto = await this.prisma.puesto.findUnique({
        where: { id: createKpiDto.puestoId },
      });

      if (!puesto) {
        throw new NotFoundException(
          `Puesto con ID ${createKpiDto.puestoId} no encontrado`,
        );
      }

      // Validar que el puesto pertenezca al área o su área padre
      if (puesto.areaId !== createKpiDto.areaId) {
        const areaPuesto = await this.prisma.area.findUnique({
          where: { id: puesto.areaId },
          include: { areaPadre: true },
        });

        const esCompatible =
          areaPuesto?.areaPadreId === createKpiDto.areaId ||
          areaPuesto?.id === createKpiDto.areaId;

        if (!esCompatible) {
          throw new BadRequestException(
            'El puesto no pertenece al área seleccionada',
          );
        }
      }
    }

    // Validar que la key es única
    const kpiExistente = await this.prisma.kPI.findUnique({
      where: { key: createKpiDto.key },
    });

    if (kpiExistente) {
      throw new ConflictException(
        `Ya existe un KPI con la key ${createKpiDto.key}`,
      );
    }

    // Validar formulaCalculo es JSON válido
    try {
      JSON.parse(createKpiDto.formulaCalculo);
    } catch (error) {
      throw new BadRequestException('formulaCalculo debe ser un JSON válido');
    }

    // Calcular umbralAmarillo si hay meta y tolerancia
    let umbralAmarillo = createKpiDto.umbralAmarillo;
    if (createKpiDto.meta && createKpiDto.tolerancia && !umbralAmarillo) {
      if (createKpiDto.sentido === 'Mayor es mejor') {
        umbralAmarillo = createKpiDto.meta + createKpiDto.tolerancia;
      } else {
        umbralAmarillo = createKpiDto.meta - createKpiDto.tolerancia;
      }
    }

    // Preparar data sin el campo 'puesto' (string)
    const { puesto, ...dataWithoutPuesto } = createKpiDto as any;

    const kpi = await this.prisma.kPI.create({
      data: {
        ...dataWithoutPuesto,
        umbralAmarillo,
        tipoCriticidad: createKpiDto.tipoCriticidad || 'no_critico',
        operadorMeta: createKpiDto.operadorMeta || '=',
      },
      include: {
        areaRelacion: {
          select: {
            id: true,
            nombre: true,
          },
        },
        puesto: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return kpi;
  }

  // ============================================
  // LISTAR KPIs
  // ============================================
  async findAll(filters?: {
    areaId?: string;
    puestoId?: string;
    puesto?: string;
    activo?: boolean;
    tipoCriticidad?: string;
  }) {
    const where: any = {};

    if (filters?.areaId) where.areaId = filters.areaId;
    if (filters?.puestoId) where.puestoId = filters.puestoId;
    if (filters?.activo !== undefined) where.activo = filters.activo;
    if (filters?.tipoCriticidad) where.tipoCriticidad = filters.tipoCriticidad;

    const kpis = await this.prisma.kPI.findMany({
      where,
      include: {
        areaRelacion: {
          select: {
            id: true,
            nombre: true,
            areaPadre: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        puesto: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: [{ orden: 'asc' }, { key: 'asc' }],
    });

    return kpis;
  }

  // ============================================
  // OBTENER KPI POR ID
  // ============================================
  async findOne(id: string) {
    const kpi = await this.prisma.kPI.findUnique({
      where: { id },
      include: {
        areaRelacion: {
          select: {
            id: true,
            nombre: true,
            areaPadre: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        puesto: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!kpi) {
      throw new NotFoundException(`KPI con ID ${id} no encontrado`);
    }

    return kpi;
  }

  // ============================================
  // OBTENER KPI POR KEY
  // ============================================
  async findByKey(key: string) {
    const kpi = await this.prisma.kPI.findUnique({
      where: { key },
      include: {
        areaRelacion: {
          select: {
            id: true,
            nombre: true,
          },
        },
        puesto: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!kpi) {
      throw new NotFoundException(`KPI con key ${key} no encontrado`);
    }

    return kpi;
  }

  // ============================================
  // ACTUALIZAR KPI
  // ============================================
  async update(id: string, updateKpiDto: UpdateKpiDto) {
    await this.findOne(id);

    // Validar puesto si se especifica
    if (updateKpiDto.puestoId) {
      const puesto = await this.prisma.puesto.findUnique({
        where: { id: updateKpiDto.puestoId },
      });

      if (!puesto) {
        throw new NotFoundException(
          `Puesto con ID ${updateKpiDto.puestoId} no encontrado`,
        );
      }
    }

    // Validar formulaCalculo si se proporciona
    if (updateKpiDto.formulaCalculo) {
      try {
        JSON.parse(updateKpiDto.formulaCalculo);
      } catch (error) {
        throw new BadRequestException('formulaCalculo debe ser un JSON válido');
      }
    }

    // Recalcular umbralAmarillo si se actualizan meta o tolerancia
    let umbralAmarillo = updateKpiDto.umbralAmarillo;
    if (updateKpiDto.meta && updateKpiDto.tolerancia && !umbralAmarillo) {
      if (updateKpiDto.sentido === 'Mayor es mejor') {
        umbralAmarillo = updateKpiDto.meta + updateKpiDto.tolerancia;
      } else {
        umbralAmarillo = updateKpiDto.meta - updateKpiDto.tolerancia;
      }
    }

    // Preparar data sin el campo 'puesto' (string)
    const { puesto, ...dataWithoutPuesto } = updateKpiDto as any;

    const kpi = await this.prisma.kPI.update({
      where: { id },
      data: {
        ...dataWithoutPuesto,
        umbralAmarillo,
      },
      include: {
        areaRelacion: {
          select: {
            id: true,
            nombre: true,
          },
        },
        puesto: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return kpi;
  }

  // ============================================
  // ELIMINAR KPI
  // ============================================
  async remove(id: string) {
    await this.findOne(id);

    // Verificar que no esté siendo usado en evaluaciones
    const enUso = await this.prisma.evaluacionDetalle.count({
      where: { kpiId: id },
    });

    if (enUso > 0) {
      throw new BadRequestException(
        `No se puede eliminar el KPI porque está siendo usado en ${enUso} evaluación(es)`,
      );
    }

    await this.prisma.kPI.delete({ where: { id } });
    return { message: 'KPI eliminado exitosamente' };
  }

  // ============================================
  // OBTENER KPIs POR EMPLEADO
  // ============================================
  async getKpisPorEmpleado(empleadoId: string) {
    const empleado = await this.prisma.user.findUnique({
      where: { id: empleadoId },
      include: {
        area: true,
        puesto: true,
      },
    });

    if (!empleado) {
      throw new NotFoundException('Empleado no encontrado');
    }

    // Si el empleado no tiene área asignada, no puede tener KPIs
    if (!empleado.areaId) {
      return [];
    }

    // Construir condiciones OR dinámicamente para evitar pasar null a Prisma
    const orConditions: { areaId: string; puestoId?: string | null }[] = [
      // KPIs generales del área (sin puesto específico)
      { areaId: empleado.areaId, puestoId: null },
    ];

    // Solo agregar filtro de puesto si el empleado tiene uno asignado
    if (empleado.puestoId) {
      orConditions.push({
        areaId: empleado.areaId,
        puestoId: empleado.puestoId,
      });
    }

    // Buscar KPIs del área y puesto del empleado
    const kpis = await this.prisma.kPI.findMany({
      where: {
        OR: orConditions,
        activo: true,
      },
      include: {
        areaRelacion: {
          select: {
            id: true,
            nombre: true,
          },
        },
        puesto: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: { orden: 'asc' },
    });

    return kpis;
  }

  // ============================================
  // OBTENER KPIs POR ÁREA (incluye sub-áreas)
  // ============================================
  async getKpisPorArea(areaId: string) {
    const area = await this.prisma.area.findUnique({
      where: { id: areaId },
      include: {
        subAreas: {
          select: { id: true },
        },
      },
    });

    if (!area) {
      throw new NotFoundException('Área no encontrada');
    }

    // Incluir área y sub-áreas
    const areasIds = [areaId];
    if (area.subAreas && area.subAreas.length > 0) {
      areasIds.push(...area.subAreas.map((sub) => sub.id));
    }

    const kpis = await this.prisma.kPI.findMany({
      where: {
        areaId: { in: areasIds },
        activo: true,
      },
      include: {
        areaRelacion: {
          select: {
            id: true,
            nombre: true,
          },
        },
        puesto: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: { orden: 'asc' },
    });

    return kpis;
  }

  // ============================================
  // TOGGLE ACTIVO/INACTIVO
  // ============================================
  async toggle(id: string) {
    const kpi = await this.findOne(id);

    const updated = await this.prisma.kPI.update({
      where: { id },
      data: { activo: !kpi.activo },
      include: {
        areaRelacion: {
          select: { id: true, nombre: true },
        },
        puesto: {
          select: { id: true, nombre: true },
        },
      },
    });

    return updated;
  }

  // ============================================
  // CALCULAR RESULTADO DE UN KPI
  // ============================================
  async calcularResultado(dto: {
    kpiId: string;
    valores: Record<string, any>;
  }) {
    const kpi = await this.findOne(dto.kpiId);

    let formula: any;
    try {
      formula = JSON.parse(kpi.formulaCalculo);
    } catch {
      throw new BadRequestException(
        'formulaCalculo del KPI no es un JSON válido',
      );
    }

    let resultado: number | null = null;

    switch (kpi.tipoCalculo) {
      case 'binario': {
        // Espera { valor: 0 | 1 }
        resultado = dto.valores['valor'] ?? 0;
        break;
      }
      case 'division': {
        // Espera { numerador: number, denominador: number }
        const numerador = Number(
          dto.valores[formula.numerador] ?? dto.valores['numerador'] ?? 0,
        );
        const denominador = Number(
          dto.valores[formula.denominador] ?? dto.valores['denominador'] ?? 1,
        );
        if (denominador === 0)
          throw new BadRequestException('El denominador no puede ser 0');
        resultado = (numerador / denominador) * 100;
        break;
      }
      case 'conteo': {
        // Espera { cantidad: number }
        resultado = Number(dto.valores['cantidad'] ?? 0);
        break;
      }
      case 'porcentaje_kpis_equipo': {
        // Espera { kpisVerdes: number, totalKpis: number }
        const kpisVerdes = Number(dto.valores['kpisVerdes'] ?? 0);
        const totalKpis = Number(dto.valores['totalKpis'] ?? 1);
        if (totalKpis === 0)
          throw new BadRequestException('totalKpis no puede ser 0');
        resultado = (kpisVerdes / totalKpis) * 100;
        break;
      }
      case 'dashboard_presentado': {
        // Espera { presentado: boolean }
        resultado = dto.valores['presentado'] ? 1 : 0;
        break;
      }
      default: {
        // Tipo personalizado: retorna los valores tal cual
        resultado = Number(dto.valores['resultado'] ?? 0);
      }
    }

    // Determinar estado según meta y umbrales
    let estado: 'verde' | 'amarillo' | 'rojo' | null = null;
    if (kpi.meta !== null && kpi.meta !== undefined && resultado !== null) {
      const cumpleMeta = this.evaluarMeta(
        resultado,
        kpi.meta,
        kpi.operadorMeta ?? '=',
      );
      if (cumpleMeta) {
        estado = 'verde';
      } else if (
        kpi.umbralAmarillo !== null &&
        kpi.umbralAmarillo !== undefined
      ) {
        const cumpleAmarillo = this.evaluarMeta(
          resultado,
          kpi.umbralAmarillo,
          kpi.operadorMeta ?? '=',
        );
        estado = cumpleAmarillo ? 'amarillo' : 'rojo';
      } else {
        estado = 'rojo';
      }
    }

    return {
      kpiId: kpi.id,
      key: kpi.key,
      indicador: kpi.indicador,
      resultado,
      estado,
      meta: kpi.meta,
      umbralAmarillo: kpi.umbralAmarillo,
    };
  }

  // ============================================
  // VALIDAR FORMULA DE CALCULO
  // ============================================
  async validarFormula(formulaCalculo: string, tipoCalculo: string) {
    // Validar que sea JSON válido
    let formula: any;
    try {
      formula = JSON.parse(formulaCalculo);
    } catch {
      throw new BadRequestException('formulaCalculo debe ser un JSON válido');
    }

    const errores: string[] = [];

    switch (tipoCalculo) {
      case 'division':
        if (!formula.numerador)
          errores.push('Falta el campo "numerador" en la fórmula');
        if (!formula.denominador)
          errores.push('Falta el campo "denominador" en la fórmula');
        break;
      case 'binario':
      case 'conteo':
      case 'dashboard_presentado':
      case 'porcentaje_kpis_equipo':
        // No requieren campos específicos en la fórmula
        break;
      case 'personalizado':
        if (!formula.descripcion)
          errores.push(
            'Se recomienda incluir "descripcion" en fórmulas personalizadas',
          );
        break;
      default:
        errores.push(`Tipo de cálculo desconocido: ${tipoCalculo}`);
    }

    return {
      valido: errores.length === 0,
      errores,
      formulaParsed: formula,
    };
  }

  // ============================================
  // HELPER: Evaluar si resultado cumple la meta
  // ============================================
  private evaluarMeta(
    resultado: number,
    meta: number,
    operador: string,
  ): boolean {
    switch (operador) {
      case '>':
        return resultado > meta;
      case '>=':
        return resultado >= meta;
      case '=':
        return resultado === meta;
      case '<=':
        return resultado <= meta;
      case '<':
        return resultado < meta;
      default:
        return false;
    }
  }

  async subirEvidenciaKPI(dto: {
    kpiId: string;
    empleadoId: string;
    periodo: string;
    archivoUrl: string;
    tipo: string;
    nombre: string;
    tamanio?: number;
    valorNumerico?: number;
    nota?: string;
  }) {
    const kpi = await this.prisma.kPI.findUnique({ where: { id: dto.kpiId } });
    if (!kpi) throw new NotFoundException('KPI no encontrado');

    const intentosPrevios = await this.prisma.evidenciaKPI.count({
      where: {
        kpiId: dto.kpiId,
        empleadoId: dto.empleadoId,
        periodo: dto.periodo,
      },
    });

    return this.prisma.evidenciaKPI.create({
      data: {
        ...dto,
        intento: intentosPrevios + 1,
        status: 'pendiente_revision',
      },
      include: {
        kpi: { select: { id: true, key: true, indicador: true } },
        empleado: { select: { id: true, nombre: true, apellido: true } },
      },
    });
  }

  async getMisEvidencias(empleadoId: string, periodo: string) {
    const evidencias = await this.prisma.evidenciaKPI.findMany({
      where: { empleadoId, periodo },
      orderBy: { createdAt: 'asc' },
    });
    const agrupadas: Record<string, any[]> = {};
    for (const ev of evidencias) {
      if (!agrupadas[ev.kpiId]) agrupadas[ev.kpiId] = [];
      agrupadas[ev.kpiId].push(ev);
    }
    return agrupadas;
  }

  async revisarEvidenciaKPI(
    evidenciaId: string,
    jefeId: string,
    dto: { status: 'aprobada' | 'rechazada'; motivoRechazo?: string },
  ) {
    const ev = await this.prisma.evidenciaKPI.findUnique({
      where: { id: evidenciaId },
    });
    if (!ev) throw new NotFoundException('Evidencia no encontrada');
    if (dto.status === 'rechazada' && !dto.motivoRechazo)
      throw new BadRequestException('Se requiere motivo de rechazo');
    return this.prisma.evidenciaKPI.update({
      where: { id: evidenciaId },
      data: {
        status: dto.status,
        motivoRechazo: dto.motivoRechazo,
        revisadoPor: jefeId,
        fechaRevision: new Date(),
      },
      include: {
        kpi: { select: { id: true, key: true, indicador: true } },
        empleado: { select: { id: true, nombre: true, apellido: true } },
      },
    });
  }

  async apelarEvidenciaKPI(evidenciaId: string, apelacion: string) {
    const ev = await this.prisma.evidenciaKPI.findUnique({
      where: { id: evidenciaId },
    });
    if (!ev) throw new NotFoundException('Evidencia no encontrada');
    if (ev.status !== 'rechazada')
      throw new BadRequestException(
        'Solo se puede apelar evidencias rechazadas',
      );
    if (ev.apelacion) throw new BadRequestException('Ya existe una apelacion');
    return this.prisma.evidenciaKPI.update({
      where: { id: evidenciaId },
      data: { apelacion, fechaApelacion: new Date() },
    });
  }

  async responderApelacionKPI(
    evidenciaId: string,
    respuesta: string,
    confirmaRechazo: boolean,
  ) {
    const ev = await this.prisma.evidenciaKPI.findUnique({
      where: { id: evidenciaId },
    });
    if (!ev) throw new NotFoundException('Evidencia no encontrada');
    if (!ev.apelacion) throw new BadRequestException('Sin apelacion pendiente');
    return this.prisma.evidenciaKPI.update({
      where: { id: evidenciaId },
      data: {
        respuestaApelacion: respuesta,
        status: confirmaRechazo ? 'rechazada' : 'aprobada',
      },
    });
  }

  async getEvidenciasPendientesKPI(userId: string) {
    // 1. Evidencias por revisores asignados manualmente
    const asignaciones = await this.prisma.revisorAsignado.findMany({
      where: { revisorId: userId, activo: true },
      select: { empleadoId: true },
    });
    const empleadosAsignados = asignaciones.map((a) => a.empleadoId);

    // 2. Evidencias por jerarquía normal (jefe de área)
    const areaJefe = await this.prisma.area.findFirst({
      where: { jefeId: userId },
      include: { subAreas: { select: { id: true } } },
    });
    const areaIds = areaJefe
      ? [areaJefe.id, ...areaJefe.subAreas.map((s) => s.id)]
      : [];

    // Empleados del área pero excluir los que tienen revisor asignado a otro
    // (para no mostrar duplicados si un empleado tiene revisor manual diferente)
    let empleadosDelArea: string[] = [];
    if (areaIds.length > 0) {
      const empleadosArea = await this.prisma.user.findMany({
        where: { areaId: { in: areaIds }, activo: true },
        select: { id: true },
      });
      const idsArea = empleadosArea.map((e) => e.id);

      // Excluir empleados del área que tienen revisor asignado a OTRO (no a userId)
      const conRevisorOtro = await this.prisma.revisorAsignado.findMany({
        where: {
          empleadoId: { in: idsArea },
          activo: true,
          revisorId: { not: userId },
        },
        select: { empleadoId: true },
      });
      const excluidos = new Set(conRevisorOtro.map((r) => r.empleadoId));
      empleadosDelArea = idsArea.filter((id) => !excluidos.has(id));
    }

    // 3. Union de ambos grupos
    const todosEmpleados = [
      ...new Set([...empleadosAsignados, ...empleadosDelArea]),
    ];
    if (todosEmpleados.length === 0) return [];

    return this.prisma.evidenciaKPI.findMany({
      where: {
        status: 'pendiente_revision',
        empleadoId: { in: todosEmpleados },
      },
      include: {
        kpi: {
          select: {
            id: true,
            key: true,
            indicador: true,
            tipoCriticidad: true,
            area: true,
          },
        },
        empleado: {
          select: { id: true, nombre: true, apellido: true, areaId: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
