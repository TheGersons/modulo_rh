import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateOrdenTrabajoDto {
  @IsString()
  @IsOptional()
  descripcion?: string;

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
