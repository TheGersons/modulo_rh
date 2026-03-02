import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';

@Injectable()
export class PuestosService {
  constructor(private prisma: PrismaService) {}

  async findAll(areaId?: string) {
    const where = areaId ? { areaId } : {};

    return this.prisma.puesto.findMany({
      where,
      include: {
        area: {
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
        _count: {
          select: {
            empleados: true,
            kpis: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const puesto = await this.prisma.puesto.findUnique({
      where: { id },
      include: {
        area: true,
        _count: {
          select: {
            empleados: true,
            kpis: true,
          },
        },
      },
    });

    if (!puesto) {
      throw new NotFoundException(`Puesto con ID ${id} no encontrado`);
    }

    return puesto;
  }

  async create(createPuestoDto: CreatePuestoDto) {
    // Validar que el área exista
    const area = await this.prisma.area.findUnique({
      where: { id: createPuestoDto.areaId },
    });

    if (!area) {
      throw new NotFoundException(
        `Área con ID ${createPuestoDto.areaId} no encontrada`,
      );
    }

    // Validar nombre único en el área
    const existente = await this.prisma.puesto.findFirst({
      where: {
        nombre: createPuestoDto.nombre,
        areaId: createPuestoDto.areaId,
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un puesto con el nombre "${createPuestoDto.nombre}" en esta área`,
      );
    }

    return this.prisma.puesto.create({
      data: createPuestoDto,
      include: {
        area: true,
      },
    });
  }

  async update(id: string, updatePuestoDto: UpdatePuestoDto) {
    await this.findOne(id);

    // Si cambia el nombre, validar unicidad
    if (updatePuestoDto.nombre || updatePuestoDto.areaId) {
      const puesto = await this.findOne(id);
      const nombre = updatePuestoDto.nombre || puesto.nombre;
      const areaId = updatePuestoDto.areaId || puesto.areaId;

      const existente = await this.prisma.puesto.findFirst({
        where: {
          nombre,
          areaId,
          id: { not: id },
        },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe un puesto con ese nombre en esta área`,
        );
      }
    }

    return this.prisma.puesto.update({
      where: { id },
      data: updatePuestoDto,
      include: {
        area: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Verificar que no tenga empleados asignados
    const count = await this.prisma.user.count({
      where: { puestoId: id },
    });

    if (count > 0) {
      throw new ConflictException(
        `No se puede eliminar el puesto porque tiene ${count} empleado(s) asignado(s)`,
      );
    }

    await this.prisma.puesto.delete({ where: { id } });
    return { message: 'Puesto eliminado exitosamente' };
  }
}
