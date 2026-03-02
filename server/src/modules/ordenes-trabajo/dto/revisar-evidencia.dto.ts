import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class RevisarEvidenciaDto {
  @IsString()
  @IsIn(['aprobada', 'rechazada'])
  status: string;

  @IsString()
  @IsOptional()
  motivoRechazo?: string;
}
