import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EditarFechaLimiteDto {
  @IsDateString()
  @IsNotEmpty()
  nuevaFecha: string;

  @IsString()
  @IsOptional()
  motivo?: string;
}
