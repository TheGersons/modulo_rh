import { IsString, IsIn, IsOptional } from 'class-validator';

export class ResponderSolicitudTareaDto {
  @IsString()
  @IsIn(['aprobada', 'rechazada'])
  status: string;

  @IsString()
  @IsOptional()
  motivoRechazo?: string;
}
