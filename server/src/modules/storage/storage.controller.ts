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
import { ConfiguracionService } from 'src/common/configuracion/configuracion.service';
import { enVentanaGracia, getVentanaGracia, formatPeriodo } from 'src/common/utils/grace-period.util';

const TIPOS_PERMITIDOS = [
  // Imágenes
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
  // PDF
  'application/pdf',
  // Videos
  'video/mp4',
  'video/quicktime',
  'video/avi',
  'video/x-msvideo',
  'video/webm',
  'video/x-ms-wmv',
  // Word
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Excel
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // PowerPoint
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Texto y datos
  'text/plain',
  'text/csv',
  'application/csv',
  // Comprimidos
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/vnd.rar',
  'application/x-7z-compressed',
  // AutoCAD
  'image/vnd.dwg',
  'image/x-dwg',
  'application/acad',
  'image/vnd.dxf',
  'image/x-dxf',
  // Correos electrónicos
  'message/rfc822',
  'application/vnd.ms-outlook',
  // Microsoft Project
  'application/vnd.ms-project',
  'application/x-project',
];

const uploadOptions = {
  limits: { fileSize: 30 * 1024 * 1024 },
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
    private configuracion: ConfiguracionService,
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

    const diasGracia = await this.configuracion.getDiasGracia();

    // Defensa-en-profundidad: si el cliente envía el período del mes actual
    // pero estamos dentro de la ventana de gracia del mes anterior, la subida
    // pertenece al mes anterior. Esto protege contra clientes con JS cacheado
    // que aún no aplican la lógica de gracia para KPIs no-OT.
    const ahora = new Date();
    const periodoActualSrv = formatPeriodo(ahora);
    const mesAnteriorDate = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    const periodoAnteriorSrv = formatPeriodo(mesAnteriorDate);
    if (
      body.periodo === periodoActualSrv &&
      enVentanaGracia(ahora, periodoAnteriorSrv, diasGracia)
    ) {
      body.periodo = periodoAnteriorSrv;
      body.anio = String(mesAnteriorDate.getFullYear());
    }

    // KPIs basados en órdenes de trabajo solo aceptan respaldos durante la
    // ventana de gracia (días 1..N del mes siguiente al periodo).
    const kpi = await this.prisma.kPI.findUnique({
      where: { id: body.kpiId },
      select: { aplicaOrdenTrabajo: true },
    });
    let esRespaldoGracia = false;
    if (kpi?.aplicaOrdenTrabajo) {
      if (!enVentanaGracia(new Date(), body.periodo, diasGracia)) {
        const { inicio, fin } = getVentanaGracia(body.periodo, diasGracia);
        throw new BadRequestException(
          `Solo puedes subir respaldo de este KPI durante la ventana de gracia ` +
            `(${inicio.toLocaleDateString('es-MX')} – ${fin.toLocaleDateString('es-MX')}).`,
        );
      }
      esRespaldoGracia = true;
    }

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
        esRespaldoGracia,
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
