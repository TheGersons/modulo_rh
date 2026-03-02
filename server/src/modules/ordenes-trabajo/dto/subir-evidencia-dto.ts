import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';

export class SubirEvidenciaDto {
  @IsString()
  @IsNotEmpty()
  tareaId: string;

  @IsString()
  @IsNotEmpty()
  archivoUrl: string;

  @IsString()
  @IsNotEmpty()
  tipo: string; // "imagen", "pdf", "video", "documento"

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsInt()
  @IsOptional()
  tamanio?: number;
}
