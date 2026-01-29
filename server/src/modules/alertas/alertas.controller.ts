import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';

@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Post()
  create(@Body() createAlertaDto: CreateAlertaDto) {
    return this.alertasService.create(createAlertaDto);
  }

  @Post('generar-automaticas')
  generarAlertasAutomaticas() {
    return this.alertasService.generarAlertasAutomaticas();
  }

  @Get()
  findAll(
    @Query('tipo') tipo?: string,
    @Query('nivel') nivel?: string,
    @Query('status') status?: string,
    @Query('areaId') areaId?: string,
    @Query('activas') activas?: string,
  ) {
    const filters: any = {};

    if (tipo) filters.tipo = tipo;
    if (nivel) filters.nivel = nivel;
    if (status) filters.status = status;
    if (areaId) filters.areaId = areaId;
    if (activas === 'true') filters.activas = true;

    return this.alertasService.findAll(filters);
  }

  @Get('estadisticas')
  getEstadisticas() {
    return this.alertasService.getEstadisticas();
  }

  @Get('activas')
  findActivas() {
    return this.alertasService.findActivas();
  }

  @Get('area/:areaId')
  findByArea(@Param('areaId') areaId: string) {
    return this.alertasService.findByArea(areaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlertaDto: UpdateAlertaDto) {
    return this.alertasService.update(id, updateAlertaDto);
  }

  @Post(':id/resolver')
  resolver(
    @Param('id') id: string,
    @Body() body: { accionTomada: string; responsableId?: string },
  ) {
    return this.alertasService.resolver(id, body.accionTomada, body.responsableId);
  }

  @Post(':id/descartar')
  descartar(@Param('id') id: string, @Body() body: { motivo: string }) {
    return this.alertasService.descartar(id, body.motivo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alertasService.remove(id);
  }
}