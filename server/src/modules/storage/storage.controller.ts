// src/storage/storage.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from 'src/common/database/prisma.service';
import { AlertasService } from '../alertas/alertas.service';

const TIPOS_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'video/mp4',
  'video/quicktime',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const uploadOptions = {
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    TIPOS_PERMITIDOS.includes(file.mimetype)
      ? cb(null, true)
      : cb(
          new BadRequestException('Tipo no permitido: ' + file.mimetype),
          false,
        );
  },
};

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(
    private storageService: StorageService,
    private prisma: PrismaService,
    private alertasService: AlertasService,
  ) {}

  @Post('evidencia-kpi')
  @UseInterceptors(FileInterceptor('archivo', uploadOptions))
  async subirEvidenciaKpi(
    @UploadedFile() archivo,
    @Body() body,
    @Request() req,
  ) {
    if (!archivo) throw new BadRequestException('No se recibio archivo');
    const userId = req.user.userId;
    const empleado = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { area: true },
    });
    if (!empleado) throw new BadRequestException('Empleado no encontrado');

    const ruta = this.storageService.buildKpiPath({
      areaNombre: empleado.area?.nombre || 'sin_area',
      empleadoNombre: `${empleado.nombre}_${empleado.apellido}`,
      empleadoId: empleado.id,
      anio: parseInt(body.anio) || new Date().getFullYear(),
      periodo: body.periodo || 'sin_periodo',
      kpiKey: body.kpiKey,
      nombreArchivo: archivo.originalname,
    });

    const archivoUrl = await this.storageService.uploadFile(
      ruta,
      archivo.buffer,
      archivo.mimetype,
    );
    const intentoPrevio = await this.prisma.evidenciaKPI.count({
      where: { kpiId: body.kpiId, empleadoId: userId, periodo: body.periodo },
    });

    const evidencia = await this.prisma.evidenciaKPI.create({
      data: {
        kpiId: body.kpiId,
        empleadoId: userId,
        periodo: body.periodo,
        archivoUrl,
        tipo: archivo.mimetype,
        nombre: archivo.originalname,
        tamanio: archivo.size,
        valorNumerico: body.valorNumerico
          ? parseFloat(body.valorNumerico)
          : null,
        nota: body.nota || null,
        intento: intentoPrevio + 1,
        status: 'pendiente_revision',
        esFueraDeTiempo: false,
      },
    });
    return { success: true, evidencia, archivoUrl };
  }

  @Post('evidencia-orden')
  @UseInterceptors(FileInterceptor('archivo', uploadOptions))
  async subirEvidenciaOrden(
    @UploadedFile() archivo,
    @Body() body,
    @Request() req,
  ) {
    if (!archivo) throw new BadRequestException('No se recibio archivo');
    const tarea = await this.prisma.tarea.findUnique({
      where: { id: body.tareaId },
      include: {
        ordenTrabajo: {
          include: { empleado: { include: { area: true } }, kpi: true },
        },
      },
    });
    if (!tarea) throw new BadRequestException('Tarea no encontrada');

    const orden = tarea.ordenTrabajo;
    const empleado = orden.empleado;
    const ahora = new Date();
    const periodo = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;

    const ruta = this.storageService.buildOrdenPath({
      areaNombre: empleado.area?.nombre || 'sin_area',
      empleadoNombre: `${empleado.nombre}_${empleado.apellido}`,
      empleadoId: empleado.id,
      anio: ahora.getFullYear(),
      periodo,
      ordenTitulo: body.ordenTitulo || orden.titulo,
      nombreArchivo: archivo.originalname,
    });

    const archivoUrl = await this.storageService.uploadFile(
      ruta,
      archivo.buffer,
      archivo.mimetype,
    );
    const intentoPrevio = await this.prisma.evidencia.count({
      where: { tareaId: body.tareaId },
    });
    const esFueraDeTiempo = orden.fechaLimite
      ? new Date() > new Date(orden.fechaLimite)
      : false;

    const evidencia = await this.prisma.evidencia.create({
      data: {
        tareaId: body.tareaId,
        archivoUrl,
        tipo: archivo.mimetype,
        nombre: archivo.originalname,
        tamanio: archivo.size,
        intento: intentoPrevio + 1,
        status: 'pendiente_revision',
        esFueraDeTiempo,
      },
    });

    // Generar alerta para el jefe cuando el empleado sube evidencia
    await this.alertasService
      .alertaEvidenciaSubida(orden, esFueraDeTiempo)
      .catch(() => null);

    return { success: true, evidencia, archivoUrl };
  }
}
