import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateAlertaDto {
  @IsString()
  @IsNotEmpty()
  areaId: string;

  @IsString()
  @IsOptional()
  empleadoId?: string;

  @IsString()
  @IsOptional()
  evaluacionId?: string;

  @IsString()
  @IsOptional()
  ordenTrabajoId?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([
    'orden_vencida',
    'orden_completada',
    'orden_por_vencer',
    'orden_asignada',
    'kpi_critico',
    'evidencia_rechazada',
    'evidencia_aprobada',
    'evidencia_apelada',
    'evidencia_pendiente',
    'carga_alta',
    'solicitud_tarea_pendiente',
    'solicitud_edicion_pendiente',
  ])
  tipo: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['BAJO', 'MEDIO', 'ALTO'])
  nivel: string;

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsOptional()
  accionSugerida?: string;

  @IsString()
  @IsOptional()
  responsable?: string;
}
