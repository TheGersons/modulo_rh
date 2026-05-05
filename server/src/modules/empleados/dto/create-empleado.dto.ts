import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsIn,
  IsUUID,
} from 'class-validator';
import { ROLES } from '../../../common/constants/roles';

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
  @IsIn(ROLES as readonly string[])
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
