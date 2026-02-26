import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { UpdateKpiDto } from './dto/update-kpi.dto';
import { CalcularKpiDto } from './dto/calcular-kpi.dto';

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

    // Validar que la key es única
    const kpiExistente = await this.prisma.kPI.findUnique({
      where: { key: createKpiDto.key },
    });

    if (kpiExistente) {
      throw new BadRequestException(
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

    const kpi = await this.prisma.kPI.create({
      data: {
        ...createKpiDto,
        umbralAmarillo,
        tipoCriticidad: createKpiDto.tipoCriticidad || 'no_critico',
        operadorMeta: createKpiDto.operadorMeta || '=',
      },
      include: {
        areaRelacion: {
          select: {
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
    puesto?: string;
    activo?: boolean;
    tipoCriticidad?: string;
  }) {
    const where: any = {};

    if (filters?.areaId) where.areaId = filters.areaId;
    if (filters?.puesto) where.puesto = filters.puesto;
    if (filters?.activo !== undefined) where.activo = filters.activo;
    if (filters?.tipoCriticidad) where.tipoCriticidad = filters.tipoCriticidad;

    const kpis = await this.prisma.kPI.findMany({
      where,
      include: {
        areaRelacion: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: [{ orden: 'asc' }, { createdAt: 'desc' }],
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
  // ACTUALIZAR KPI
  // ============================================
  async update(id: string, updateKpiDto: UpdateKpiDto) {
    await this.findOne(id);

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

    const kpi = await this.prisma.kPI.update({
      where: { id },
      data: {
        ...updateKpiDto,
        umbralAmarillo,
      },
      include: {
        areaRelacion: {
          select: {
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

    // Verificar que no tenga órdenes de trabajo asociadas
    const ordenesCount = await this.prisma.ordenTrabajo.count({
      where: { kpiId: id },
    });

    if (ordenesCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar este KPI porque tiene órdenes de trabajo asociadas',
      );
    }

    await this.prisma.kPI.delete({
      where: { id },
    });

    return { message: 'KPI eliminado exitosamente' };
  }

  // ============================================
  // TOGGLE ACTIVO
  // ============================================
  async toggle(id: string) {
    const kpi = await this.findOne(id);

    return this.prisma.kPI.update({
      where: { id },
      data: {
        activo: !kpi.activo,
      },
    });
  }

  // ============================================
  // MOTOR DE CÁLCULO
  // ============================================
  async calcularResultado(calcularDto: CalcularKpiDto) {
    const kpi = await this.findOne(calcularDto.kpiId);
    const formula = JSON.parse(kpi.formulaCalculo);
    const valores = calcularDto.valores;

    let resultado: number;
    let detalleCalculo: string;

    switch (kpi.tipoCalculo) {
      case 'binario':
        // Espera un campo "cumplido" en valores (true/false)
        resultado = valores.cumplido === true ? 100 : 0;
        detalleCalculo = `Cumplimiento binario: ${valores.cumplido ? 'SÍ' : 'NO'}`;
        break;

      case 'division':
        // Espera numerador y denominador en valores
        const numerador = valores[formula.numerador];
        const denominador = valores[formula.denominador];

        if (!numerador || !denominador) {
          throw new BadRequestException(
            `Faltan valores: ${formula.numerador} y ${formula.denominador}`,
          );
        }

        if (denominador === 0) {
          throw new BadRequestException('El denominador no puede ser cero');
        }

        const multiplicador = formula.multiplicador || 1;
        resultado = (numerador / denominador) * multiplicador;

        if (formula.invertir) {
          resultado = 100 - resultado;
        }

        detalleCalculo = `(${numerador} / ${denominador}) × ${multiplicador} = ${resultado.toFixed(2)}`;
        break;

      case 'conteo':
        // Espera un campo con el conteo
        resultado = valores[formula.target] || 0;
        detalleCalculo = `Conteo de ${formula.target}: ${resultado}`;
        break;

      case 'porcentaje_kpis_equipo':
        // Espera "total_kpis" y "kpis_verdes"
        const totalKpis = valores.total_kpis || 0;
        const kpisVerdes = valores.kpis_verdes || 0;

        if (totalKpis === 0) {
          resultado = 0;
        } else {
          resultado = (kpisVerdes / totalKpis) * 100;
        }

        detalleCalculo = `(${kpisVerdes} / ${totalKpis}) × 100 = ${resultado.toFixed(2)}%`;
        break;

      case 'dashboard_presentado':
        // Espera "presentado" (true/false)
        resultado = valores.presentado === true ? 100 : 0;
        detalleCalculo = `Dashboard ${valores.presentado ? 'presentado' : 'no presentado'}`;
        break;

      case 'personalizado':
        // Lógica custom según la fórmula
        throw new BadRequestException(
          'Tipo de cálculo personalizado no implementado aún',
        );

      default:
        throw new BadRequestException(
          `Tipo de cálculo ${kpi.tipoCalculo} no reconocido`,
        );
    }

    // Determinar estado (verde/amarillo/rojo)
    const estado = this.determinarEstado(resultado, kpi);

    return {
      kpiId: kpi.id,
      indicador: kpi.indicador,
      tipoCalculo: kpi.tipoCalculo,
      resultado: Math.round(resultado * 100) / 100,
      meta: kpi.meta,
      operadorMeta: kpi.operadorMeta,
      umbralAmarillo: kpi.umbralAmarillo,
      estado,
      detalleCalculo,
      valoresIngresados: valores,
    };
  }

  // ============================================
  // DETERMINAR ESTADO (VERDE/AMARILLO/ROJO)
  // ============================================
  private determinarEstado(resultado: number, kpi: any): string {
    if (!kpi.meta) return 'verde'; // Si no hay meta, siempre verde

    const meta = kpi.meta;
    const umbral = kpi.umbralAmarillo || meta;
    const operador = kpi.operadorMeta || '=';

    let cumpleMeta = false;

    switch (operador) {
      case '>':
        cumpleMeta = resultado > meta;
        break;
      case '>=':
        cumpleMeta = resultado >= meta;
        break;
      case '=':
        cumpleMeta = Math.abs(resultado - meta) < 0.01; // Tolerancia mínima
        break;
      case '<=':
        cumpleMeta = resultado <= meta;
        break;
      case '<':
        cumpleMeta = resultado < meta;
        break;
    }

    if (cumpleMeta) {
      return 'verde';
    }

    // Verificar si está en zona amarilla
    if (kpi.sentido === 'Mayor es mejor') {
      return resultado >= umbral ? 'amarillo' : 'rojo';
    } else {
      return resultado <= umbral ? 'amarillo' : 'rojo';
    }
  }

  // ============================================
  // VALIDAR FÓRMULA
  // ============================================
  async validarFormula(formulaCalculo: string, tipoCalculo: string) {
    try {
      const formula = JSON.parse(formulaCalculo);

      // Validar estructura según tipo
      switch (tipoCalculo) {
        case 'binario':
          if (!formula.descripcion) {
            throw new Error('Falta campo "descripcion"');
          }
          break;

        case 'division':
          if (!formula.numerador || !formula.denominador) {
            throw new Error('Faltan campos "numerador" y "denominador"');
          }
          break;

        case 'conteo':
          if (!formula.target) {
            throw new Error('Falta campo "target"');
          }
          break;

        case 'porcentaje_kpis_equipo':
          if (!formula.filtro) {
            throw new Error('Falta campo "filtro"');
          }
          break;

        case 'dashboard_presentado':
          if (!formula.descripcion) {
            throw new Error('Falta campo "descripcion"');
          }
          break;

        default:
          throw new Error(`Tipo de cálculo ${tipoCalculo} no reconocido`);
      }

      return { valido: true, mensaje: 'Fórmula válida' };
    } catch (error: any) {
      return { valido: false, mensaje: error.message };
    }
  }
}
