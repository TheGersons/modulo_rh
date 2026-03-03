import { IsString, IsIn, IsOptional, IsDateString } from 'class-validator';

export class ResponderSolicitudTareaDto {
  @IsString()
  @IsIn(['aprobada', 'rechazada'])
  status: string;

  @IsString()
  @IsOptional()
  motivoRechazo?: string;

  @IsDateString()
  @IsOptional()
  nuevaFechaLimite?: string;
}
