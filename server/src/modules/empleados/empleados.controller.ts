import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('empleados')
@UseGuards(JwtAuthGuard)
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Post()
  create(@Body() createEmpleadoDto: CreateEmpleadoDto) {
    return this.empleadosService.create(createEmpleadoDto);
  }

  @Get()
  findAll(
    @Query('areaId') areaId?: string,
    @Query('role') role?: string,
    @Query('activo') activo?: string,
    @Query('search') search?: string,
  ) {
    const filters: any = {};

    if (areaId) filters.areaId = areaId;
    if (role) filters.role = role;
    if (activo !== undefined) filters.activo = activo === 'true';
    if (search) filters.search = search;

    return this.empleadosService.findAll(filters);
  }

  @Get('estadisticas')
  getEstadisticasGlobales() {
    return this.empleadosService.getEstadisticasGlobales();
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.empleadosService.search(query);
  }

  @Get('area/:areaId')
  findByArea(@Param('areaId') areaId: string) {
    return this.empleadosService.findByArea(areaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empleadosService.findOne(id);
  }

  @Get(':id/evaluaciones')
  getEvaluaciones(@Param('id') id: string) {
    return this.empleadosService.getEvaluaciones(id);
  }

  @Get(':id/estadisticas')
  getEstadisticas(@Param('id') id: string) {
    return this.empleadosService.getEstadisticas(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmpleadoDto: UpdateEmpleadoDto,
  ) {
    return this.empleadosService.update(id, updateEmpleadoDto);
  }

  @Patch(':id/toggle')
  toggleActivo(@Param('id') id: string) {
    return this.empleadosService.toggleActivo(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadosService.remove(id);
  }
  // En empleados.controller.ts

  @Post('bulk')
  createBulk(@Body() createEmpleadoDtos: CreateEmpleadoDto[]) {
    return this.empleadosService.createBulk(createEmpleadoDtos);
  }
}
