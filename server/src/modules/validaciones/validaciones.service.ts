import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateValidacionDto } from './dto/create-validacion.dto';
import { ResponderValidacionDto } from './dto/responder-validacion.dto';

@Injectable()
export class ValidacionesService {
    constructor(private prisma: PrismaService) { }

    // ============================================
    // CREAR VALIDACIÓN (Empleado valida su evaluación)
    // ============================================
    async create(createValidacionDto: CreateValidacionDto) {
        // Verificar que la evaluación existe
        const evaluacion = await this.prisma.evaluacion.findUnique({
            where: { id: createValidacionDto.evaluacionId },
            include: {
                empleado: true,
                evaluador: true,
            },
        });

        if (!evaluacion) {
            throw new NotFoundException(
                `No se encontró la evaluación con ID ${createValidacionDto.evaluacionId}`,
            );
        }

        // Validar que la evaluación esté en estado "enviada"
        if (evaluacion.status !== 'enviada') {
            throw new BadRequestException('Solo se pueden validar evaluaciones en estado "enviada"');
        }

        // Validar que no exista ya una validación
        const validacionExistente = await this.prisma.validacion.findUnique({
            where: { evaluacionId: createValidacionDto.evaluacionId },
        });

        if (validacionExistente) {
            throw new BadRequestException('Esta evaluación ya ha sido validada');
        }

        // Si el empleado NO acepta, debe proporcionar motivo
        if (createValidacionDto.status === 'revision_solicitada' && !createValidacionDto.motivoRevision) {
            throw new BadRequestException('Debe proporcionar un motivo si solicita revisión');
        }

        // Crear validación
        const validacion = await this.prisma.validacion.create({
            data: {
                evaluacionId: createValidacionDto.evaluacionId,
                empleadoId: createValidacionDto.empleadoId,
                status: createValidacionDto.status,
                motivoRevision: createValidacionDto.motivoRevision,
                fechaValidacion: new Date(),
            },
            include: {
                evaluacion: {
                    include: {
                        empleado: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                            },
                        },
                        evaluador: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                            },
                        },
                    },
                },
            },
        });

        // Actualizar el status de la evaluación
        const nuevoStatus = createValidacionDto.status === 'aceptada' ? 'validada' : 'en_revision';
        await this.prisma.evaluacion.update({
            where: { id: createValidacionDto.evaluacionId },
            data: {
                status: nuevoStatus,
                fechaValidacion: createValidacionDto.status === 'aceptada' ? new Date() : null,
            },
        });

        // TODO: Crear notificación al jefe si se solicita revisión
        if (createValidacionDto.status === 'revision_solicitada') {
            console.log(`📧 Notificación: ${evaluacion.empleado.nombre} solicita revisión de evaluación`);
            // await this.notificacionesService.crear({
            //   tipo: 'revision_solicitada',
            //   destinatarioId: evaluacion.evaluadorId,
            //   titulo: 'Revisión de evaluación solicitada',
            //   mensaje: `${evaluacion.empleado.nombre} ${evaluacion.empleado.apellido} ha solicitado revisión de su evaluación`,
            // });
        }

        return validacion;
    }

    // ============================================
    // OBTENER VALIDACIÓN POR EVALUACIÓN
    // ============================================
    async findByEvaluacion(evaluacionId: string) {
        const evaluacion = await this.prisma.evaluacion.findUnique({
            where: { id: evaluacionId },
        });

        if (!evaluacion) {
            throw new NotFoundException(`No se encontró la evaluación con ID ${evaluacionId}`);
        }

        const validacion = await this.prisma.validacion.findUnique({
            where: { evaluacionId },
            include: {
                evaluacion: {
                    include: {
                        empleado: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                                puesto: true,
                            },
                        },
                        evaluador: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                                puesto: true,
                            },
                        },
                    },
                },
            },
        });

        if (!validacion) {
            throw new NotFoundException('Esta evaluación aún no ha sido validada');
        }

        return validacion;
    }

    // ============================================
    // OBTENER VALIDACIÓN POR ID
    // ============================================
    async findOne(id: string) {
        const validacion = await this.prisma.validacion.findUnique({
            where: { id },
            include: {
                evaluacion: {
                    include: {
                        empleado: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                                puesto: true,
                            },
                        },
                        evaluador: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                                puesto: true,
                            },
                        },
                        detalles: {
                            include: {
                                kpi: {
                                    select: {
                                        id: true,
                                        key: true,
                                        indicador: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!validacion) {
            throw new NotFoundException(`No se encontró la validación con ID ${id}`);
        }

        return validacion;
    }

    // ============================================
    // LISTAR TODAS LAS VALIDACIONES
    // ============================================
    async findAll(filters?: { status?: string; pendienteRespuesta?: boolean }) {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.pendienteRespuesta) {
            where.status = 'revision_solicitada';
            where.respuestaJefe = null;
        }

        const validaciones = await this.prisma.validacion.findMany({
            where,
            include: {
                evaluacion: {
                    include: {
                        empleado: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                                puesto: true,
                            },
                        },
                        evaluador: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                fechaValidacion: 'desc',
            },
        });

        return validaciones;
    }

    // ============================================
    // JEFE RESPONDE A UNA REVISIÓN SOLICITADA
    // ============================================
    async responder(id: string, responderValidacionDto: ResponderValidacionDto) {
        const validacion = await this.findOne(id);

        // Validar que sea una solicitud de revisión (no aceptada)
        if (validacion.status === 'aceptada') {
            throw new BadRequestException('Esta evaluación ya fue aceptada, no requiere respuesta');
        }

        // Validar que no haya sido respondida ya
        if (validacion.respuestaJefe) {
            throw new BadRequestException('Esta solicitud de revisión ya ha sido respondida');
        }

        // Actualizar validación con respuesta del jefe
        const validacionActualizada = await this.prisma.validacion.update({
            where: { id },
            data: {
                respuestaJefe: responderValidacionDto.respuestaJefe,
            },
            include: {
                evaluacion: {
                    include: {
                        empleado: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                            },
                        },
                    },
                },
            },
        });

        // TODO: Crear notificación al empleado
        console.log(
            `📧 Notificación: El jefe ha respondido a la solicitud de revisión de ${validacion.evaluacion.empleado.nombre}`,
        );

        return validacionActualizada;
    }

    // ============================================
    // OBTENER VALIDACIONES PENDIENTES DE RESPUESTA
    // ============================================
    async findPendientes() {
        return this.findAll({ pendienteRespuesta: true });
    }

    // ============================================
    // OBTENER VALIDACIONES POR EMPLEADO
    // ============================================
    async findByEmpleado(empleadoId: string) {
        const empleado = await this.prisma.user.findUnique({
            where: { id: empleadoId },
        });

        if (!empleado) {
            throw new NotFoundException(`No se encontró el empleado con ID ${empleadoId}`);
        }

        const validaciones = await this.prisma.validacion.findMany({
            where: {
                evaluacion: {
                    empleadoId,
                },
            },
            include: {
                evaluacion: {
                    include: {
                        evaluador: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                fechaValidacion: 'desc',
            },
        });

        return validaciones;
    }

    // ============================================
    // OBTENER VALIDACIONES POR JEFE (evaluador)
    // ============================================
    async findByJefe(jefeId: string) {
        const jefe = await this.prisma.user.findUnique({
            where: { id: jefeId },
        });

        if (!jefe) {
            throw new NotFoundException(`No se encontró el jefe con ID ${jefeId}`);
        }

        const validaciones = await this.prisma.validacion.findMany({
            where: {
                evaluacion: {
                    evaluadorId: jefeId,
                },
            },
            include: {
                evaluacion: {
                    include: {
                        empleado: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                                puesto: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                fechaValidacion: 'desc',
            },
        });

        return validaciones;
    }

    // ============================================
    // ESTADÍSTICAS DE VALIDACIONES
    // ============================================
    async getEstadisticas() {
        const total = await this.prisma.validacion.count();
        const aceptadas = await this.prisma.validacion.count({ where: { status: 'aceptada' } });
        const revisionSolicitada = await this.prisma.validacion.count({ where: { status: 'revision_solicitada' } });
        const pendientesRespuesta = await this.prisma.validacion.count({
            where: {
                status: 'revision_solicitada',
                respuestaJefe: null,
            },
        });
        const respondidas = await this.prisma.validacion.count({
            where: {
                status: 'revision_solicitada',
                respuestaJefe: { not: null },
            },
        });

        const porcentajeAceptacion = total > 0 ? Math.round((aceptadas / total) * 10000) / 100 : 0;

        return {
            total,
            aceptadas,
            revisionSolicitada,
            pendientesRespuesta,
            respondidas,
            porcentajeAceptacion,
        };
    }
}