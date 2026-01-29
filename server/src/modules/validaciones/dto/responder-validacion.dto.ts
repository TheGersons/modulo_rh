import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ResponderValidacionDto {
  @IsString()
  @IsNotEmpty()
  respuestaJefe: string;

  @IsString()
  @IsOptional()
  accionTomada?: string;
}