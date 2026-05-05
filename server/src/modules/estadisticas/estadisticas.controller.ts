import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/decorators/roles.decorator';

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

  @Get('ranking-areas')
  getRankingAreas() {
    return this.estadisticasService.getRankingAreas();
  }

  @Get('ranking-areas/:areaId/sub-areas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'rrhh')
  getRankingSubAreas(@Param('areaId') areaId: string) {
    return this.estadisticasService.getRankingSubAreas(areaId);
  }

  @Get('ranking-areas/:areaId/empleados')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'rrhh')
  getEmpleadosDeArea(
    @Param('areaId') areaId: string,
    @Query('periodo') periodo?: string,
  ) {
    const periodoActual =
      periodo ??
      (() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      })();
    return this.estadisticasService.getEmpleadosDeArea(areaId, periodoActual);
  }
}
