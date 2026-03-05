import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CrearRevisorAsignadoDto {
  @IsString()
  empleadoId: string;

  @IsString()
  revisorId: string;

  @IsOptional()
  @IsString()
  motivo?: string;
}

export class ActualizarRevisorAsignadoDto {
  @IsOptional()
  @IsString()
  revisorId?: string;

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
