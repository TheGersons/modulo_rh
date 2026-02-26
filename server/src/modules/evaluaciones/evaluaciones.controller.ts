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
import { EvaluacionesService } from './evaluaciones.service';
import { CerrarPeriodoDto } from './dto/cerrar-periodo.dto';

@Controller('evaluaciones')
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  @Post('cerrar-periodo')
  cerrarPeriodo(@Body() cerrarDto: CerrarPeriodoDto) {
    // TODO: Obtener evaluadorId del token JWT
    const evaluadorId = 'SISTEMA';
    return this.evaluacionesService.cerrarPeriodo(cerrarDto, evaluadorId);
  }

  @Get()
  findAll(
    @Query('empleadoId') empleadoId?: string,
    @Query('periodo') periodo?: string,
    @Query('anio') anio?: string,
    @Query('status') status?: string,
  ) {
    return this.evaluacionesService.findAll({
      empleadoId,
      periodo,
      anio: anio ? parseInt(anio) : undefined,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evaluacionesService.findOne(id);
  }

  @Patch(':id/cerrar')
  cerrar(@Param('id') id: string) {
    return this.evaluacionesService.cerrarEvaluacion(id);
  }

  @Post(':id/recalcular')
  recalcular(@Param('id') id: string) {
    return this.evaluacionesService.recalcular(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.evaluacionesService.remove(id);
  }
}
