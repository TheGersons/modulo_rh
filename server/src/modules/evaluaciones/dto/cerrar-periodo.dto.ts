import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsArray,
  IsIn,
} from 'class-validator';

export class CerrarPeriodoDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
    'trimestre_1',
    'trimestre_2',
    'trimestre_3',
    'trimestre_4',
    'semestre_1',
    'semestre_2',
    'anual',
  ])
  periodo: string;

  @IsInt()
  @Min(2020)
  @Max(2100)
  anio: number;

  @IsArray()
  @IsOptional()
  empleadoIds?: string[]; // Si no se pasa, evalúa a todos

  @IsString()
  @IsOptional()
  areaId?: string; // Si se pasa, solo evalúa empleados de esa área
}
