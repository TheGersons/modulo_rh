import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
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

@Controller('ordenes-trabajo')
export class OrdenesTrabajoController {
  constructor(private readonly ordenesService: OrdenesTrabajoService) {}

  @Post()
  create(@Body() createDto: CreateOrdenTrabajoDto) {
    // TODO: Obtener creadorId del token JWT
    const creadorId = 'temp-creator-id';
    return this.ordenesService.create(createDto, creadorId);
  }

  @Post('bulk')
  createBulk(
    @Body() body: { orden: CreateOrdenTrabajoDto; empleadoIds: string[] },
  ) {
    const creadorId = 'temp-creator-id';
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
  ) {
    return this.ordenesService.findAll({
      empleadoId,
      creadorId,
      kpiId,
      status,
      tipoOrden,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordenesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateOrdenTrabajoDto) {
    return this.ordenesService.update(id, updateDto);
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

  // ============================================
  // TAREAS
  // ============================================
  @Post('tareas')
  crearTarea(@Body() createDto: CreateTareaDto) {
    return this.ordenesService.crearTarea(createDto);
  }

  @Get(':ordenId/tareas')
  getTareas(@Param('ordenId') ordenId: string) {
    return this.ordenesService.getTareas(ordenId);
  }

  @Get('tareas/:id')
  getTarea(@Param('id') id: string) {
    return this.ordenesService.getTarea(id);
  }

  // ============================================
  // EVIDENCIAS
  // ============================================
  @Post('evidencias')
  subirEvidencia(@Body() subirDto: SubirEvidenciaDto) {
    return this.ordenesService.subirEvidencia(subirDto);
  }

  @Post('evidencias/:id/revisar')
  revisarEvidencia(
    @Param('id') id: string,
    @Body() revisarDto: RevisarEvidenciaDto,
  ) {
    // TODO: Obtener jefeId del token JWT
    const jefeId = 'temp-jefe-id';
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

  @Post('solicitudes-tarea')
  solicitarTarea(@Body() solicitarDto: SolicitarTareaDto) {
    // TODO: Obtener empleadoId del token JWT
    const empleadoId = 'temp-empleado-id';
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
  // SOLICITUDES DE EDICIÓN
  // ============================================
  @Post('solicitudes-edicion')
  solicitarEdicion(@Body() solicitarDto: SolicitarEdicionDto) {
    // TODO: Obtener solicitanteId del token JWT
    const solicitanteId = 'temp-solicitante-id';
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
}
