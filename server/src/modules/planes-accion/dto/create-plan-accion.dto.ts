import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreatePlanAccionDto {
  @IsString()
  @IsNotEmpty()
  evaluacionId: string;

  @IsString()
  @IsNotEmpty()
  empleadoId: string;

  @IsString()
  @IsNotEmpty()
  kpiId: string;

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
}