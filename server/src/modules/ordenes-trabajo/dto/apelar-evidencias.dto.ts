import { IsString, IsNotEmpty } from 'class-validator';

export class ApelarEvidenciaDto {
  @IsString()
  @IsNotEmpty()
  apelacion: string;
}
