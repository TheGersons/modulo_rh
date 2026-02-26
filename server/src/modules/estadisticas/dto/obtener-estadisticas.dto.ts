import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class ObtenerEstadisticasDto {
  @IsString()
  @IsOptional()
  areaId?: string;

  @IsString()
  @IsOptional()
  empleadoId?: string;

  @IsInt()
  @IsOptional()
  @Min(2020)
  anio?: number;

  @IsString()
  @IsOptional()
  periodo?: string;
}
