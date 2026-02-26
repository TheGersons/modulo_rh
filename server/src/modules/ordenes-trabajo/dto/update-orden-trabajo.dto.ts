import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class UpdateOrdenTrabajoDto {
  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsOptional()
  fechaLimite?: string;

  @IsBoolean()
  @IsOptional()
  enPausa?: boolean;

  @IsString()
  @IsOptional()
  motivoPausa?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  requiereAprobacion?: boolean;
}
