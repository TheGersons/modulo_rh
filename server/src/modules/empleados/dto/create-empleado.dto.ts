import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateEmpleadoDto {
  @IsString()
  dni: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['admin', 'jefe', 'empleado', 'rrhh'])
  role: string;

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