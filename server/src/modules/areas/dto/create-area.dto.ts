import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateAreaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsNotEmpty()
  jefeId: string;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;

  @IsString()
  @IsNotEmpty()
  areaPadreId?: string;
}
