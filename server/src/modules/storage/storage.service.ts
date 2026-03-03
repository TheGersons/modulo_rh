import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;
  private readonly basePath: string;

  constructor(private configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('NEXTCLOUD_WEBDAV_URL') ||
      'http://localhost:8080/remote.php/dav/files/';
    this.basePath = this.configService.get<string>(
      'NEXTCLOUD_BASE_PATH',
      'Aplicativos/kpis',
    );

    this.client = axios.create({
      auth: {
        username:
          this.configService.get<string>('NEXTCLOUD_USERNAME') || 'admin',
        password:
          this.configService.get<string>('NEXTCLOUD_PASSWORD') || 'admin',
      },
      headers: { 'OCS-APIRequest': 'true' },
    });
  }

  // ─────────────────────────────────────────────
  // CONSTRUCTORES DE RUTA
  // ─────────────────────────────────────────────

  /**
   * Ruta para evidencia de KPI predefinido:
   * {basePath}/areas/{area}/{empleado}_{id}/{anio}-{periodo}/kpis/{kpiKey}_{archivo}
   *
   * Ejemplo real:
   * Aplicativos/kpis/areas/administrativa/juan_perez_abc123/2025-marzo/kpis/adm-001_reporte.pdf
   */
  buildKpiPath(params: {
    areaNombre: string;
    empleadoNombre: string;
    empleadoId: string;
    anio: number;
    periodo: string;
    kpiKey: string;
    nombreArchivo: string;
  }): string {
    const {
      areaNombre,
      empleadoNombre,
      empleadoId,
      anio,
      periodo,
      kpiKey,
      nombreArchivo,
    } = params;
    return [
      this.basePath,
      'areas',
      this.sanitize(areaNombre),
      this.sanitize(`${empleadoNombre}_${empleadoId}`),
      this.sanitize(`${anio}-${periodo}`),
      'kpis',
      this.sanitize(`${kpiKey}_${nombreArchivo}`),
    ].join('/');
  }

  /**
   * Ruta para evidencia de Orden de Trabajo:
   * {basePath}/areas/{area}/{empleado}_{id}/{anio}-{periodo}/ordenes/{ordenTitulo}_{archivo}
   *
   * Ejemplo real:
   * Aplicativos/kpis/areas/administrativa/juan_perez_abc123/2025-03/ordenes/mantenimiento_foto.jpg
   */
  buildOrdenPath(params: {
    areaNombre: string;
    empleadoNombre: string;
    empleadoId: string;
    anio: number;
    periodo: string;
    ordenTitulo: string;
    nombreArchivo: string;
  }): string {
    const {
      areaNombre,
      empleadoNombre,
      empleadoId,
      anio,
      periodo,
      ordenTitulo,
      nombreArchivo,
    } = params;
    return [
      this.basePath,
      'areas',
      this.sanitize(areaNombre),
      this.sanitize(`${empleadoNombre}_${empleadoId}`),
      this.sanitize(`${anio}-${periodo}`),
      'ordenes',
      this.sanitize(`${ordenTitulo}_${nombreArchivo}`),
    ].join('/');
  }

  // ─────────────────────────────────────────────
  // OPERACIONES DE ARCHIVOS
  // ─────────────────────────────────────────────

  /**
   * Sube un archivo a Nextcloud via WebDAV (PUT).
   * Crea toda la estructura de carpetas recursivamente si no existen.
   * Retorna la URL WebDAV completa del archivo subido.
   */
  async uploadFile(
    rutaDestino: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    await this.ensureFolderPath(rutaDestino);

    const url = `${this.baseUrl}/${encodeURIPath(rutaDestino)}`;
    this.logger.log(`Subiendo archivo: ${rutaDestino}`);

    await this.client.put(url, buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': buffer.length,
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    this.logger.log(`Archivo subido correctamente: ${rutaDestino}`);
    const publicUrl = await this.getShareLink(rutaDestino);
    return publicUrl;
  }

  /**
   * Elimina un archivo de Nextcloud.
   * Si ya no existe (404) lo ignora silenciosamente.
   */
  async deleteFile(archivoUrl: string): Promise<void> {
    try {
      await this.client.delete(archivoUrl);
      this.logger.log(`Archivo eliminado: ${archivoUrl}`);
    } catch (error) {
      if (error.response?.status !== 404) {
        this.logger.error(
          `Error eliminando archivo: ${archivoUrl}`,
          error.message,
        );
        throw error;
      }
    }
  }

  /**
   * Verifica si un archivo o carpeta existe en Nextcloud via PROPFIND.
   */
  async exists(ruta: string): Promise<boolean> {
    const url = `${this.baseUrl}/${encodeURIPath(ruta)}`;
    try {
      await this.client.request({
        method: 'PROPFIND',
        url,
        headers: { Depth: '0' },
      });
      return true;
    } catch (error) {
      if (error.response?.status === 404) return false;
      throw error;
    }
  }

  // ─────────────────────────────────────────────
  // INTERNOS
  // ─────────────────────────────────────────────

  /**
   * Crea recursivamente todas las carpetas intermedias de una ruta de archivo.
   *
   * Para "areas/Admin/Juan/2025-marzo/kpis/archivo.pdf" crea:
   *   areas
   *   areas/Admin
   *   areas/Admin/Juan
   *   areas/Admin/Juan/2025-marzo
   *   areas/Admin/Juan/2025-marzo/kpis
   * (omite el ultimo segmento porque es el archivo, no una carpeta)
   */
  private async ensureFolderPath(rutaArchivo: string): Promise<void> {
    const partes = rutaArchivo.split('/');
    partes.pop(); // quitar nombre del archivo

    let rutaAcumulada = '';
    for (const parte of partes) {
      rutaAcumulada = rutaAcumulada ? `${rutaAcumulada}/${parte}` : parte;
      await this.createFolderIfNotExists(rutaAcumulada);
    }
  }

  /**
   * Crea una carpeta usando MKCOL de WebDAV.
   * Status 405 (Method Not Allowed) = carpeta ya existe → se ignora.
   * Status 301 (Redirect) = tambien indica existencia → se ignora.
   */
  private async createFolderIfNotExists(ruta: string): Promise<void> {
    const url = `${this.baseUrl}/${encodeURIPath(ruta)}`;
    try {
      await this.client.request({ method: 'MKCOL', url });
      this.logger.debug(`Carpeta creada: ${ruta}`);
    } catch (error) {
      const status = error.response?.status;
      if (status === 405 || status === 301) {
        this.logger.debug(`Carpeta ya existe (ignorado): ${ruta}`);
        return;
      }
      this.logger.error(
        `Error creando carpeta "${ruta}": HTTP ${status} - ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Normaliza un string para usarlo como nombre de carpeta o archivo:
   * - Elimina acentos y caracteres diacriticos (e → e, a → a, etc.)
   * - Reemplaza espacios y caracteres especiales con guion bajo
   * - Colapsa guiones bajos multiples en uno solo
   * - Quita guiones al inicio y fin
   * - Convierte a minusculas
   */
  private sanitize(nombre: string): string {
    return nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(
      `${process.env.NEXTCLOUD_USERNAME}:${process.env.NEXTCLOUD_PASSWORD}`,
    ).toString('base64');
    return `Basic ${credentials}`;
  }

  private async getShareLink(filePath: string): Promise<string> {
    const shareApiUrl = `https://nx88862.your-storageshare.de/ocs/v2.php/apps/files_sharing/api/v1/shares`;
    try {
      const response = await fetch(shareApiUrl, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
          'OCS-APIRequest': 'true',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          path: `/${filePath}`,
          shareType: '3', // público
          permissions: '1', // solo lectura
        }),
      });

      if (response.ok) {
        const text = await response.text();
        const urlMatch = text.match(/<url>([^<]+)<\/url>/);
        if (urlMatch) {
          // Nextcloud devuelve algo como https://nx.../s/TOKEN
          // Para descarga/vista directa agregar /download
          return urlMatch[1];
        }
      }

      // Fallback: URL WebDAV (requiere auth)
      return `${process.env.NEXTCLOUD_WEBDAV_URL}/${filePath}`;
    } catch (error) {
      console.warn('No se pudo crear share link, usando URL directa:', error);
      return `${process.env.NEXTCLOUD_WEBDAV_URL}/${filePath}`;
    }
  }
}

/**
 * Codifica cada segmento de una ruta para URL
 * sin tocar las barras separadoras.
 * "areas/Admin Area/archivo final.pdf" => "areas/Admin%20Area/archivo%20final.pdf"
 */
function encodeURIPath(ruta: string): string {
  return ruta.split('/').map(encodeURIComponent).join('/');
}
