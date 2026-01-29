import { IsString, IsNumber, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class UpdateKpiDto {
  @IsString()
  @IsOptional()
  key?: string;

  @IsString()
  @IsOptional()
  area?: string;

  @IsString()
  @IsOptional()
  areaId?: string;

  @IsString()
  @IsOptional()
  puesto?: string;

  @IsString()
  @IsOptional()
  indicador?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  formula?: string;

  @IsNumber()
  @IsOptional()
  meta?: number;

  @IsNumber()
  @IsOptional()
  tolerancia?: number;

  @IsString()
  @IsOptional()
  @IsIn(['mensual', 'trimestral', 'semestral', 'anual'])
  periodicidad?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Mayor es mejor', 'Menor es mejor'])
  sentido?: string;

  @IsString()
  @IsOptional()
  unidad?: string;

  @IsNumber()
  @IsOptional()
  orden?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}