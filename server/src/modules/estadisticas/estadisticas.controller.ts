import { Controller, Get, Query } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';

@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('dashboard')
  getDashboard() {
    return this.estadisticasService.getDashboardGlobal();
  }

  @Get('area')
  getEstadisticasArea(@Query('areaId') areaId: string) {
    return this.estadisticasService.getEstadisticasArea(areaId);
  }

  @Get('empleado')
  getEstadisticasEmpleado(@Query('empleadoId') empleadoId: string) {
    return this.estadisticasService.getEstadisticasEmpleado(empleadoId);
  }

  @Get('carga-laboral')
  getCargaLaboral(@Query('areaId') areaId?: string) {
    return this.estadisticasService.getCargaLaboral(areaId);
  }

  @Get('tendencias')
  getTendencias(@Query('areaId') areaId?: string) {
    return this.estadisticasService.getTendencias(areaId);
  }

  @Get('kpis-resumen')
  getResumenKpis() {
    return this.estadisticasService.getResumenPorTipoKpi();
  }
}
