import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PlanesAccionService } from './planes-accion.service';
import { CreatePlanAccionDto } from './dto/create-plan-accion.dto';
import { UpdatePlanAccionDto } from './dto/update-plan-accion.dto';
import { AprobarPlanDto } from './dto/aprobar-plan.dto';
import { RechazarPlanDto } from './dto/recharzar-plan.dto';

@Controller('planes-accion')
export class PlanesAccionController {
  constructor(private readonly planesAccionService: PlanesAccionService) {}

  @Post()
  create(@Body() createPlanAccionDto: CreatePlanAccionDto) {
    return this.planesAccionService.create(createPlanAccionDto);
  }

  @Post('crear-automaticos/:evaluacionId')
  crearAutomaticos(@Param('evaluacionId') evaluacionId: string) {
    return this.planesAccionService.crearPlanesAutomaticos(evaluacionId);
  }

  @Get()
  findAll(
    @Query('empleadoId') empleadoId?: string,
    @Query('status') status?: string,
    @Query('evaluacionId') evaluacionId?: string,
  ) {
    const filters: any = {};
    if (empleadoId) filters.empleadoId = empleadoId;
    if (status) filters.status = status;
    if (evaluacionId) filters.evaluacionId = evaluacionId;

    return this.planesAccionService.findAll(filters);
  }

  @Get('empleado/:empleadoId')
  findByEmpleado(@Param('empleadoId') empleadoId: string) {
    return this.planesAccionService.findByEmpleado(empleadoId);
  }

  @Get('evaluacion/:evaluacionId')
  findByEvaluacion(@Param('evaluacionId') evaluacionId: string) {
    return this.planesAccionService.findByEvaluacion(evaluacionId);
  }

  @Get('pendientes-envio')
  findPendientesEnvio() {
    return this.planesAccionService.findPendientesEnvio();
  }

  @Get('vencidos')
  findVencidos() {
    return this.planesAccionService.findVencidos();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planesAccionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanAccionDto: UpdatePlanAccionDto) {
    return this.planesAccionService.update(id, updatePlanAccionDto);
  }

  @Post(':id/enviar')
  enviar(@Param('id') id: string) {
    return this.planesAccionService.enviar(id);
  }

  @Post(':id/aprobar')
  aprobar(@Param('id') id: string, @Body() aprobarPlanDto: AprobarPlanDto) {
    return this.planesAccionService.aprobar(id, aprobarPlanDto);
  }

  @Post(':id/rechazar')
  rechazar(@Param('id') id: string, @Body() rechazarPlanDto: RechazarPlanDto) {
    return this.planesAccionService.rechazar(id, rechazarPlanDto);
  }

  @Post(':id/completar')
  completar(@Param('id') id: string) {
    return this.planesAccionService.completar(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planesAccionService.remove(id);
  }
}