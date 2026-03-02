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

  @Get()
  findAll(
    @Query('areaId') areaId?: string,
    @Query('empleadoId') empleadoId?: string,
    @Query('tipo') tipo?: string,
    @Query('nivel') nivel?: string,
    @Query('status') status?: string,
  ) {
    return this.alertasService.findAll({
      areaId,
      empleadoId,
      tipo,
      nivel,
      status,
    });
  }

  @Get('estadisticas')
  getEstadisticas(@Query('areaId') areaId?: string) {
    return this.alertasService.getEstadisticas(areaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlertaDto: UpdateAlertaDto) {
    return this.alertasService.update(id, updateAlertaDto);
  }

  @Patch(':id/resolver')
  resolver(@Param('id') id: string) {
    return this.alertasService.resolver(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alertasService.remove(id);
  }

  @Post('generar-automaticas')
  generarAutomaticas() {
    return this.alertasService.generarAlertasAutomaticas();
  }
}
