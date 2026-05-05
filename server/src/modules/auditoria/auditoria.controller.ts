import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('auditoria')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'auditor')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get('evidencias-kpi')
  getEvidenciasKpi(
    @Query('periodo') periodo?: string,
    @Query('areaId') areaId?: string,
    @Query('empleadoId') empleadoId?: string,
    @Query('status') status?: string,
    @Query('fueraDeTiempo') fueraDeTiempo?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.auditoriaService.getEvidenciasKpi({
      periodo,
      areaId,
      empleadoId,
      status,
      fueraDeTiempo:
        fueraDeTiempo === 'true'
          ? true
          : fueraDeTiempo === 'false'
            ? false
            : undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get('evidencias-orden')
  getEvidenciasOrden(
    @Query('periodo') periodo?: string,
    @Query('areaId') areaId?: string,
    @Query('empleadoId') empleadoId?: string,
    @Query('status') status?: string,
    @Query('fueraDeTiempo') fueraDeTiempo?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.auditoriaService.getEvidenciasOrden({
      periodo,
      areaId,
      empleadoId,
      status,
      fueraDeTiempo:
        fueraDeTiempo === 'true'
          ? true
          : fueraDeTiempo === 'false'
            ? false
            : undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get('resumen')
  getResumen(
    @Query('periodo') periodo?: string,
    @Query('areaId') areaId?: string,
    @Query('empleadoId') empleadoId?: string,
  ) {
    return this.auditoriaService.getResumen({ periodo, areaId, empleadoId });
  }
}
