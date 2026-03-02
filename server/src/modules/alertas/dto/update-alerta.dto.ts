import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateAlertaDto {
  @IsString()
  @IsOptional()
  @IsIn(['activa', 'en_proceso', 'resuelta'])
  status?: string;

  @IsString()
  @IsOptional()
  responsable?: string;
}
