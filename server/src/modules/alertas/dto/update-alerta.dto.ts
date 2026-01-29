import { IsString, IsIn, IsOptional } from 'class-validator';

export class UpdateAlertaDto {
  @IsString()
  @IsOptional()
  @IsIn(['pendiente', 'en_proceso', 'resuelta', 'descartada'])
  status?: string;

  @IsString()
  @IsOptional()
  accionTomada?: string;

  @IsString()
  @IsOptional()
  responsableId?: string;
}