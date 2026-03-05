import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RevisoresAsignadosService } from './revisores-asignados.service';
import {
  CrearRevisorAsignadoDto,
  ActualizarRevisorAsignadoDto,
} from './dto/crear-revisor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guards';

@Controller('revisores-asignados')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'rrhh')
export class RevisoresAsignadosController {
  constructor(private readonly service: RevisoresAsignadosService) {}

  // GET /revisores-asignados — lista todas las asignaciones activas + inactivas
  @Get()
  getAll() {
    return this.service.getAll();
  }

  // GET /revisores-asignados/empleados-disponibles — empleados sin revisor asignado
  @Get('empleados-disponibles')
  getEmpleadosSinRevisor() {
    return this.service.getEmpleadosSinRevisor();
  }

  // GET /revisores-asignados/posibles-revisores — todos los usuarios activos
  @Get('posibles-revisores')
  getPosiblesRevisores() {
    return this.service.getPosiblesRevisores();
  }

  // GET /revisores-asignados/empleado/:empleadoId — revisor asignado de un empleado
  @Get('empleado/:empleadoId')
  getRevisorDeEmpleado(@Param('empleadoId') empleadoId: string) {
    return this.service.getRevisorDeEmpleado(empleadoId);
  }

  // POST /revisores-asignados — crear nueva asignación
  @Post()
  crear(@Body() dto: CrearRevisorAsignadoDto) {
    return this.service.crear(dto);
  }

  // PATCH /revisores-asignados/:id — editar revisor, motivo, o activar/desactivar
  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarRevisorAsignadoDto,
  ) {
    return this.service.actualizar(id, dto);
  }

  // DELETE /revisores-asignados/:id — eliminar asignación
  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.service.eliminar(id);
  }
}
