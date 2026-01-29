import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class CreateValidacionDto {
  @IsString()
  @IsNotEmpty()
  evaluacionId: string;

  @IsString()
  @IsNotEmpty()
  empleadoId: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['aceptada', 'revision_solicitada'])
  status: string;

  @IsString()
  @IsOptional()
  motivoRevision?: string;
}