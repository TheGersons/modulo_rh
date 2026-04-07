import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
} from '@nestjs/common';
import { KpisService } from './kpis.service';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { UpdateKpiDto } from './dto/update-kpi.dto';
import { CalcularKpiDto } from './dto/calcular-kpi.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('kpis')
@UseGuards(JwtAuthGuard)
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  // ── POST sin parámetro ─────────────────────────────────────

  @Post()
  create(@Body() createKpiDto: CreateKpiDto) {
    return this.kpisService.create(createKpiDto);
  }

  // ── GET con paths fijos (DEBEN ir antes de :id) ────────────

  @Get()
  findAll(
    @Query('areaId') areaId?: string,
    @Query('puesto') puesto?: string,
    @Query('activo') activo?: string,
    @Query('tipoCriticidad') tipoCriticidad?: string,
  ) {
    return this.kpisService.findAll({
      areaId,
      puesto,
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
      tipoCriticidad,
    });
  }

  @Get('mis-kpis')
  getMisKpis(@Request() req) {
    return this.kpisService.getKpisPorEmpleado(req.user.userId);
  }

  @Get('mis-evidencias')
  getMisEvidencias(@Request() req, @Query('periodo') periodo?: string) {
    return this.kpisService.getMisEvidencias(
      req.user.userId,
      periodo ?? getPeriodoActual(),
    );
  }

  @Get('mis-notas')
  getMisNotas(@Request() req, @Query('periodo') periodo?: string) {
    return this.kpisService.getMisNotas(
      req.user.userId,
      periodo ?? getPeriodoActual(),
    );
  }

  @Get('pendientes-revision')
  getEvidenciasPendientes(@Request() req) {
    return this.kpisService.getEvidenciasPendientesKPI(req.user.userId);
  }

  @Get('resultados-auto-equipo')
  getResultadosAutoEquipo(
    @Request() req,
    @Query('periodo') periodo?: string,
  ) {
    return this.kpisService.getResultadosAutoEquipo(
      req.user.userId,
      periodo ?? getPeriodoActual(),
    );
  }

  // ── GET con parámetro (siempre al final de los GETs) ───────

  @Get(':id/resultado-automatico')
  getResultadoAutomatico(
    @Param('id') id: string,
    @Request() req,
    @Query('periodo') periodo?: string,
  ) {
    return this.kpisService.getResultadoAutomatico(
      id,
      req.user.userId,
      periodo ?? getPeriodoActual(),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kpisService.findOne(id);
  }

  // ── PATCH / DELETE ─────────────────────────────────────────

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKpiDto: UpdateKpiDto) {
    return this.kpisService.update(id, updateKpiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kpisService.remove(id);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string) {
    return this.kpisService.toggle(id);
  }

  @Post(':id/nota')
  guardarNota(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { nota: string; periodo?: string },
  ) {
    return this.kpisService.guardarNotaKPI(
      id,
      req.user.userId,
      body.periodo ?? getPeriodoActual(),
      body.nota,
    );
  }

  // ── POST con paths fijos ───────────────────────────────────

  @Post('calcular')
  calcular(@Body() calcularDto: CalcularKpiDto) {
    return this.kpisService.calcularResultado(calcularDto);
  }

  @Post('validar-formula')
  validarFormula(
    @Body() body: { formulaCalculo: string; tipoCalculo: string },
  ) {
    return this.kpisService.validarFormula(
      body.formulaCalculo,
      body.tipoCalculo,
    );
  }

  // ── EVIDENCIAS KPI ─────────────────────────────────────────

  @Post('evidencias')
  subirEvidencia(
    @Body()
    body: {
      kpiId: string;
      periodo?: string;
      archivoUrl: string;
      tipo: string;
      nombre: string;
      tamanio?: number;
      valorNumerico?: number;
      nota?: string;
    },
    @Request() req,
  ) {
    return this.kpisService.subirEvidenciaKPI({
      ...body,
      empleadoId: req.user.userId,
      periodo: body.periodo ?? getPeriodoActual(),
    });
  }

  @Post('evidencias/:id/revisar')
  revisarEvidencia(
    @Param('id') id: string,
    @Body() body: { status: 'aprobada' | 'rechazada'; motivoRechazo?: string },
    @Request() req,
  ) {
    return this.kpisService.revisarEvidenciaKPI(id, req.user.userId, body);
  }

  @Delete('evidencias/:id')
  eliminarEvidencia(@Param('id') id: string, @Request() req) {
    return this.kpisService.eliminarEvidenciaKPI(id, req.user.userId);
  }

  @Post('evidencias/:id/apelar')
  apelarEvidencia(
    @Param('id') id: string,
    @Body() body: { apelacion: string },
  ) {
    return this.kpisService.apelarEvidenciaKPI(id, body.apelacion);
  }

  @Post('evidencias/:id/responder-apelacion')
  responderApelacion(
    @Param('id') id: string,
    @Body() body: { respuesta: string; confirmaRechazo: boolean },
  ) {
    return this.kpisService.responderApelacionKPI(
      id,
      body.respuesta,
      body.confirmaRechazo,
    );
  }
}

function getPeriodoActual(): string {
  const now = new Date();
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
}
