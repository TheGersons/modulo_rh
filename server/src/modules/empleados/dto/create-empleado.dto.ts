import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsIn,
  IsUUID,
} from 'class-validator';

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

  @IsUUID()
  @IsOptional()
  puestoId?: string; // ID de la tabla Puesto (relación)

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
