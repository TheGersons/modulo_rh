import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class CreateAlertaDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['riesgo_alto', 'kpi_critico', 'tendencia_negativa', 'evaluacion_pendiente', 'revision_solicitada'])
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
  accionSugerida?: string;

  @IsString()
  @IsOptional()
  responsable?: string;
}