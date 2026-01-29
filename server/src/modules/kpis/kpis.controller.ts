import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { KpisService } from './kpis.service';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { UpdateKpiDto } from './dto/update-kpi.dto';

@Controller('kpis')
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @Post()
  create(@Body() createKpiDto: CreateKpiDto) {
    return this.kpisService.create(createKpiDto);
  }

  @Get()
  findAll(
    @Query('areaId') areaId?: string,
    @Query('puesto') puesto?: string,
    @Query('activo') activo?: string,
  ) {
    const filters: any = {};

    if (areaId) filters.areaId = areaId;
    if (puesto) filters.puesto = puesto;
    if (activo !== undefined) filters.activo = activo === 'true';

    return this.kpisService.findAll(filters);
  }

  @Get('key/:key')
  findByKey(@Param('key') key: string) {
    return this.kpisService.findByKey(key);
  }

  @Get('area/:areaId')
  findByArea(@Param('areaId') areaId: string) {
    return this.kpisService.findByArea(areaId);
  }

  @Get('puesto/:puesto')
  findByPuesto(@Param('puesto') puesto: string) {
    return this.kpisService.findByPuesto(puesto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kpisService.findOne(id);
  }

  @Get(':id/estadisticas')
  getEstadisticas(@Param('id') id: string) {
    return this.kpisService.getEstadisticas(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKpiDto: UpdateKpiDto) {
    return this.kpisService.update(id, updateKpiDto);
  }

  @Patch(':id/toggle')
  toggleActivo(@Param('id') id: string) {
    return this.kpisService.toggleActivo(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kpisService.remove(id);
  }

  @Post('reordenar')
  reordenar(@Body() body: { areaId: string; orden: { id: string; orden: number }[] }) {
    return this.kpisService.reordenar(body.areaId, body.orden);
  }
}