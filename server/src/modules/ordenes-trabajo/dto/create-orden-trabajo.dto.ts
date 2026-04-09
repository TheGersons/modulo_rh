import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsNumber,
  Min,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TareaDto {
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsInt()
  @Min(1)
  orden: number;
}

export class CreateOrdenTrabajoDto {
  @IsString()
  @IsOptional()
  kpiId?: string; // null/undefined cuando tipoOrden = 'personalizado'

  @IsNumber()
  @Min(1)
  @IsOptional()
  horasLimitePersonalizado?: number; // requerido cuando kpiId es null

  @IsString()
  @IsNotEmpty()
  empleadoId: string;

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsInt()
  @Min(1)
  cantidadTareas: number;

  @IsDateString()
  @IsOptional()
  fechaLimite?: string;

  @IsString()
  @IsOptional()
  tipoOrden?: string; // "kpi_sistema" o "orden_empleado"

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TareaDto)
  @IsOptional()
  tareas?: TareaDto[];
}
