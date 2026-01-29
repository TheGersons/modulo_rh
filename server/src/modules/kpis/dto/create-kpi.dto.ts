import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsIn } from 'class-validator';

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

  @IsString()
  @IsOptional()
  formula?: string;

  @IsNumber()
  @IsNotEmpty()
  meta: number;

  @IsNumber()
  @IsNotEmpty()
  tolerancia: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['mensual', 'trimestral', 'semestral', 'anual'])
  periodicidad: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Mayor es mejor', 'Menor es mejor'])
  sentido: string;

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