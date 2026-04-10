import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { RevisarEvidenciaDto } from './dto/revisar-evidencia.dto';
import { SubirEvidenciaDto } from './dto/subir-evidencia-dto';
import { ApelarEvidenciaDto } from './dto/apelar-evidencias.dto';
import { SolicitarTareaDto } from './dto/solicitar-tarea.dto';
import { ResponderSolicitudTareaDto } from './dto/responder-solicitud-tarea.dto';
import { SolicitarEdicionDto } from './dto/solicitar-edicion.dto';
import { ResponderSolicitudEdicionDto } from './dto/responder-solicitud-edicion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ordenes-trabajo')
@UseGuards(JwtAuthGuard)
export class OrdenesTrabajoController {
  constructor(private readonly ordenesService: OrdenesTrabajoService) {}

  // ============================================
  // ÓRDENES — rutas estáticas primero
  // ============================================

  @Post()
  create(@Body() createDto: CreateOrdenTrabajoDto, @Request() req) {
    const creadorId = req.user.userId;
    return this.ordenesService.create(createDto, creadorId);
  }

  @Post('bulk')
  createBulk(
    @Body() body: { orden: CreateOrdenTrabajoDto; empleadoIds: string[] },
    @Request() req,
  ) {
    const creadorId = req.user.userId;
    return this.ordenesService.createBulk(
      body.orden,
      body.empleadoIds,
      creadorId,
    );
  }

  @Get()
  findAll(
    @Query('empleadoId') empleadoId?: string,
    @Query('creadorId') creadorId?: string,
    @Query('kpiId') kpiId?: string,
    @Query('status') status?: string,
    @Query('tipoOrden') tipoOrden?: string,
    @Query('areaId') areaId?: string,
  ) {
    return this.ordenesService.findAll({
      empleadoId,
      creadorId,
      kpiId,
      status,
      tipoOrden,
      areaId,
    });
  }

  // ============================================
  // TAREAS — estáticas antes que /:id
  // ============================================

  @Post('tareas')
  crearTarea(@Body() createDto: CreateTareaDto) {
    return this.ordenesService.crearTarea(createDto);
  }

  @Get('tareas/:id')
  getTarea(@Param('id') id: string) {
    return this.ordenesService.getTarea(id);
  }

  // ============================================
  // EVIDENCIAS — estáticas antes que /:id
  // ============================================

  @Get('evidencias-pendientes')
  getEvidenciasPendientes(@Request() req) {
    return this.ordenesService.getEvidenciasPendientes(req.user.userId);
  }

  @Post('evidencias')
  subirEvidencia(@Body() subirDto: SubirEvidenciaDto) {
    return this.ordenesService.subirEvidencia(subirDto);
  }

  @Post('evidencias/:id/revisar')
  revisarEvidencia(
    @Param('id') id: string,
    @Body() revisarDto: RevisarEvidenciaDto,
    @Request() req,
  ) {
    const jefeId = req.user.userId;
    return this.ordenesService.revisarEvidencia(id, revisarDto, jefeId);
  }

  @Post('evidencias/:id/apelar')
  apelarEvidencia(
    @Param('id') id: string,
    @Body() apelarDto: ApelarEvidenciaDto,
  ) {
    return this.ordenesService.apelarEvidencia(id, apelarDto);
  }

  @Post('evidencias/:id/responder-apelacion')
  responderApelacion(
    @Param('id') id: string,
    @Body() body: { respuesta: string; confirmaRechazo: boolean },
  ) {
    return this.ordenesService.responderApelacion(
      id,
      body.respuesta,
      body.confirmaRechazo,
    );
  }

  @Get('tareas/:tareaId/evidencias')
  getEvidencias(@Param('tareaId') tareaId: string) {
    return this.ordenesService.getEvidencias(tareaId);
  }

  // ============================================
  // SOLICITUDES DE TAREA — estáticas antes que /:id
  // ============================================

  @Post('solicitudes-tarea')
  solicitarTarea(@Body() solicitarDto: SolicitarTareaDto, @Request() req) {
    const empleadoId = req.user.userId;
    return this.ordenesService.solicitarTarea(solicitarDto, empleadoId);
  }

  @Get('solicitudes-tarea')
  getSolicitudesTarea(
    @Query('ordenTrabajoId') ordenTrabajoId?: string,
    @Query('empleadoId') empleadoId?: string,
    @Query('status') status?: string,
  ) {
    return this.ordenesService.getSolicitudesTarea({
      ordenTrabajoId,
      empleadoId,
      status,
    });
  }

  @Post('solicitudes-tarea/:id/responder')
  responderSolicitudTarea(
    @Param('id') id: string,
    @Body() responderDto: ResponderSolicitudTareaDto,
  ) {
    return this.ordenesService.responderSolicitudTarea(id, responderDto);
  }

  // ============================================
  // SOLICITUDES DE EDICIÓN — estáticas antes que /:id
  // ============================================

  @Post('solicitudes-edicion')
  solicitarEdicion(@Body() solicitarDto: SolicitarEdicionDto, @Request() req) {
    const solicitanteId = req.user.userId;
    return this.ordenesService.solicitarEdicion(solicitarDto, solicitanteId);
  }

  @Get('solicitudes-edicion')
  getSolicitudesEdicion(
    @Query('ordenTrabajoId') ordenTrabajoId?: string,
    @Query('solicitanteId') solicitanteId?: string,
    @Query('status') status?: string,
  ) {
    return this.ordenesService.getSolicitudesEdicion({
      ordenTrabajoId,
      solicitanteId,
      status,
    });
  }

  @Post('solicitudes-edicion/:id/responder')
  responderSolicitudEdicion(
    @Param('id') id: string,
    @Body() responderDto: ResponderSolicitudEdicionDto,
  ) {
    return this.ordenesService.responderSolicitudEdicion(id, responderDto);
  }

  // ============================================
  // ÓRDENES — rutas dinámicas al final
  // ============================================

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordenesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateOrdenTrabajoDto) {
    return this.ordenesService.update(id, updateDto);
  }

  @Post(':id/aprobar')
  aprobar(@Param('id') id: string) {
    return this.ordenesService.aprobar(id);
  }

  @Post(':id/pausar')
  pausar(@Param('id') id: string, @Body() body: { motivo: string }) {
    return this.ordenesService.pausar(id, body.motivo);
  }

  @Post(':id/reanudar')
  reanudar(@Param('id') id: string) {
    return this.ordenesService.reanudar(id);
  }

  @Post(':id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.ordenesService.cancelar(id);
  }

  @Post(':id/extender-fecha')
  extenderFecha(
    @Param('id') id: string,
    @Body() body: { nuevaFecha: string; motivo: string },
  ) {
    return this.ordenesService.extenderFechaLimite(
      id,
      body.nuevaFecha,
      body.motivo,
    );
  }

  @Post(':id/calcular-progreso')
  calcularProgreso(@Param('id') id: string) {
    return this.ordenesService.calcularProgreso(id);
  }

  @Get(':ordenId/tareas')
  getTareas(@Param('ordenId') ordenId: string) {
    return this.ordenesService.getTareas(ordenId);
  }
}
