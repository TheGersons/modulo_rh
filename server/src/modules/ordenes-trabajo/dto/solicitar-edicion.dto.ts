import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class SolicitarEdicionDto {
  @IsString()
  @IsNotEmpty()
  ordenTrabajoId: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['fechaLimite', 'descripcion', 'cantidadTareas'])
  campoAEditar: string;

  @IsString()
  @IsNotEmpty()
  valorNuevo: string;

  @IsString()
  @IsNotEmpty()
  justificacion: string;
}
