import {
  IsString,
  IsNotEmpty,
  IsInt,
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
  @IsNotEmpty()
  kpiId: string;

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
  fechaLimite: string;

  @IsString()
  @IsOptional()
  tipoOrden?: string; // "kpi_sistema" o "orden_empleado"

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TareaDto)
  @IsOptional()
  tareas?: TareaDto[];
}
