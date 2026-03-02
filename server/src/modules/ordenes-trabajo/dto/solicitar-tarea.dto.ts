import { IsString, IsNotEmpty } from 'class-validator';

export class SolicitarTareaDto {
  @IsString()
  @IsNotEmpty()
  ordenTrabajoId: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  justificacion: string;
}
