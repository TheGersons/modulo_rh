import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateTareaDto {
  @IsString()
  @IsNotEmpty()
  ordenTrabajoId: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsInt()
  @Min(1)
  orden: number;

  @IsBoolean()
  @IsOptional()
  solicitudAgregar?: boolean;
}
