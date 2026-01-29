import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ValidacionesService } from './validaciones.service';
import { CreateValidacionDto } from './dto/create-validacion.dto';
import { ResponderValidacionDto } from './dto/responder-validacion.dto';

@Controller('validaciones')
export class ValidacionesController {
    constructor(private readonly validacionesService: ValidacionesService) { }

    @Post()
    create(@Body() createValidacionDto: CreateValidacionDto) {
        return this.validacionesService.create(createValidacionDto);
    }

    @Get()
    findAll(
        @Query('status') status?: string,
        @Query('pendientes') pendientes?: string,
    ) {
        const filters: any = {};

        if (status) {
            filters.status = status;
        }

        if (pendientes === 'true') {
            filters.pendienteRespuesta = true;
        }

        return this.validacionesService.findAll(filters);
    }

    @Get('estadisticas')
    getEstadisticas() {
        return this.validacionesService.getEstadisticas();
    }

    @Get('pendientes')
    findPendientes() {
        return this.validacionesService.findPendientes();
    }

    @Get('empleado/:empleadoId')
    findByEmpleado(@Param('empleadoId') empleadoId: string) {
        return this.validacionesService.findByEmpleado(empleadoId);
    }

    @Get('jefe/:jefeId')
    findByJefe(@Param('jefeId') jefeId: string) {
        return this.validacionesService.findByJefe(jefeId);
    }

    @Get('evaluacion/:evaluacionId')
    findByEvaluacion(@Param('evaluacionId') evaluacionId: string) {
        return this.validacionesService.findByEvaluacion(evaluacionId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.validacionesService.findOne(id);
    }

    @Patch(':id/responder')
    responder(@Param('id') id: string, @Body() responderValidacionDto: ResponderValidacionDto) {
        return this.validacionesService.responder(id, responderValidacionDto);
    }
}