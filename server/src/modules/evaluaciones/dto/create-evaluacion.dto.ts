import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DetalleEvaluacionDto {
  @IsString()
  @IsNotEmpty()
  kpiId: string;

  @IsNumber()
  @IsNotEmpty()
  resultadoNumerico: number;

  @IsString()
  @IsOptional()
  comentarios?: string;
}

export class CreateEvaluacionDto {
  @IsString()
  @IsNotEmpty()
  empleadoId: string;

  @IsString()
  @IsNotEmpty()
  evaluadorId: string;

  @IsString()
  @IsNotEmpty()
  periodo: string;

  @IsString()
  @IsNotEmpty()
  tipoPeriodo: string;

  @IsNumber()
  @IsNotEmpty()
  anio: number;

  @IsString()
  @IsOptional()
  comentarioGeneral?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleEvaluacionDto)
  @IsOptional()
  detalles?: DetalleEvaluacionDto[];
}