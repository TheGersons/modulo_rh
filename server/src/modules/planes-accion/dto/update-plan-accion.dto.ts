import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdatePlanAccionDto {
  @IsString()
  @IsOptional()
  descripcionProblema?: string;

  @IsString()
  @IsOptional()
  accionesCorrectivas?: string;

  @IsString()
  @IsOptional()
  recursosNecesarios?: string;

  @IsString()
  @IsOptional()
  metasEspecificas?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  diasPlazo?: number;

  @IsString()
  @IsOptional()
  archivosAdjuntos?: string;
}