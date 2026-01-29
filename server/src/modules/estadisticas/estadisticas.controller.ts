import { Controller, Get, Param, Query } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';

@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('globales')
  getGlobales() {
    return this.estadisticasService.getGlobales();
  }

  @Get('area/:areaId')
  getByArea(@Param('areaId') areaId: string) {
    return this.estadisticasService.getByArea(areaId);
  }

  @Get('empleado/:empleadoId')
  getByEmpleado(@Param('empleadoId') empleadoId: string) {
    return this.estadisticasService.getByEmpleado(empleadoId);
  }

  @Get('tendencias')
  getTendencias(@Query('meses') meses?: string) {
    const mesesNum = meses ? parseInt(meses) : 6;
    return this.estadisticasService.getTendencias(mesesNum);
  }

  @Get('rankings')
  getRankings() {
    return this.estadisticasService.getRankings();
  }
}