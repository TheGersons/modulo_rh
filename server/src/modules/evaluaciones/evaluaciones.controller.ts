import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';

@Controller('evaluaciones')
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  @Post()
  create(@Body() createEvaluacionDto: CreateEvaluacionDto) {
    return this.evaluacionesService.create(createEvaluacionDto);
  }

  @Get()
  findAll(
    @Query('empleadoId') empleadoId?: string,
    @Query('evaluadorId') evaluadorId?: string,
    @Query('areaId') areaId?: string,
    @Query('periodo') periodo?: string,
    @Query('anio') anio?: string,
    @Query('status') status?: string,
  ) {
    const filters: any = {};

    if (empleadoId) filters.empleadoId = empleadoId;
    if (evaluadorId) filters.evaluadorId = evaluadorId;
    if (areaId) filters.areaId = areaId;
    if (periodo) filters.periodo = periodo;
    if (anio) filters.anio = parseInt(anio);
    if (status) filters.status = status;

    return this.evaluacionesService.findAll(filters);
  }

  @Get('empleado/:empleadoId')
  findByEmpleado(@Param('empleadoId') empleadoId: string) {
    return this.evaluacionesService.findByEmpleado(empleadoId);
  }

  @Get('evaluador/:evaluadorId')
  findByEvaluador(@Param('evaluadorId') evaluadorId: string) {
    return this.evaluacionesService.findByEvaluador(evaluadorId);
  }

  @Get('area/:areaId')
  findByArea(@Param('areaId') areaId: string) {
    return this.evaluacionesService.findByArea(areaId);
  }

  @Get('periodo/:periodo/:anio')
  findByPeriodo(@Param('periodo') periodo: string, @Param('anio') anio: string) {
    return this.evaluacionesService.findByPeriodo(periodo, parseInt(anio));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evaluacionesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEvaluacionDto: UpdateEvaluacionDto) {
    return this.evaluacionesService.update(id, updateEvaluacionDto);
  }

  @Post(':id/enviar')
  enviar(@Param('id') id: string) {
    return this.evaluacionesService.enviar(id);
  }

  @Post(':id/recalcular')
  recalcularMetricas(@Param('id') id: string) {
    return this.evaluacionesService.recalcularMetricas(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.evaluacionesService.remove(id);
  }
}