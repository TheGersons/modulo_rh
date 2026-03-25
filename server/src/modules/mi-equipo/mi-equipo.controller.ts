import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MiEquipoService } from './mi-equipo.service';

@Controller('mi-equipo')
@UseGuards(JwtAuthGuard)
export class MiEquipoController {
  constructor(private readonly miEquipoService: MiEquipoService) {}

  @Get()
  async getMiEquipo(@Request() req: any, @Query('periodo') periodo?: string) {
    const userId = req.user.userId; // ← era req.user.id
    const periodoActual =
      periodo ??
      (() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      })();
    return this.miEquipoService.getMiEquipo(userId, periodoActual);
  }

  @Get('empleado/:id/kpis')
  async getEmpleadoKpis(
    @Param('id') empleadoId: string,
    @Query('periodo') periodo?: string,
  ) {
    const periodoActual =
      periodo ??
      (() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      })();
    return this.miEquipoService.getEmpleadoKpis(empleadoId, periodoActual);
  }

  @Get('empleado/:id/ordenes')
  async getEmpleadoOrdenes(@Param('id') empleadoId: string) {
    return this.miEquipoService.getEmpleadoOrdenes(empleadoId);
  }
}
