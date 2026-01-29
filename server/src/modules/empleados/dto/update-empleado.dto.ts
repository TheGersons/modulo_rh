import { IsString, IsEmail, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class UpdateEmpleadoDto {
  @IsString()
  @IsOptional()
  dni?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  apellido?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  @IsIn(['admin', 'jefe', 'empleado', 'rrhh'])
  role?: string;

  @IsString()
  @IsOptional()
  areaId?: string;

  @IsString()
  @IsOptional()
  puesto?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}