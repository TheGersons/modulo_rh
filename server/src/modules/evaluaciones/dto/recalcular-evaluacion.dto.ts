import { IsString, IsNotEmpty } from 'class-validator';

export class RecalcularEvaluacionDto {
  @IsString()
  @IsNotEmpty()
  evaluacionId: string;
}
