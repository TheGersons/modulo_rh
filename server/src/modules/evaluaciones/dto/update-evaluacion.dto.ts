import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class DetalleEvaluacionDto {
  @IsString()
  @IsOptional()
  id?: string;

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

export class UpdateEvaluacionDto {
  @IsString()
  @IsOptional()
  periodo?: string;

  @IsNumber()
  @IsOptional()
  anio?: number;

  @IsString()
  @IsOptional()
  comentarioGeneral?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleEvaluacionDto)
  @IsOptional()
  detalles?: DetalleEvaluacionDto[];
}