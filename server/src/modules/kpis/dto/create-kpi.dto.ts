import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsInt,
  IsIn,
  IsJSON,
  IsUUID,
} from 'class-validator';

export class CreateKpiDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  area: string;

  @IsString()
  @IsNotEmpty()
  areaId: string;

  @IsString()
  @IsOptional()
  puesto?: string;

  @IsString()
  @IsNotEmpty()
  indicador: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  // Configuración de cálculo
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'binario',
    'division',
    'conteo',
    'porcentaje_kpis_equipo',
    'dashboard_presentado',
    'precision',
    'personalizado',
  ])
  tipoCalculo: string;

  @IsString()
  @IsNotEmpty()
  formulaCalculo: string; // JSON como string

  // Metas
  @IsNumber()
  @IsOptional()
  meta?: number;

  @IsString()
  @IsOptional()
  @IsIn(['>', '>=', '=', '<=', '<'])
  operadorMeta?: string;

  @IsNumber()
  @IsOptional()
  tolerancia?: number;

  @IsNumber()
  @IsOptional()
  umbralAmarillo?: number;

  // Criticidad
  @IsString()
  @IsIn(['critico', 'no_critico'])
  @IsOptional()
  tipoCriticidad?: string;

  @IsString()
  @IsNotEmpty()
  periodicidad: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Mayor es mejor', 'Menor es mejor'])
  sentido: string;

  @IsString()
  @IsOptional()
  unidad?: string;

  @IsInt()
  @IsOptional()
  orden?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsUUID()
  @IsOptional()
  puestoId?: string; // NUEVO: referencia a tabla Puesto

  @IsBoolean()
  @IsOptional()
  aplicaOrdenTrabajo?: boolean;

  @IsInt()
  @IsOptional()
  horasLimiteOrden?: number;
}
