import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreatePuestoDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsUUID()
  areaId: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
