import { IsInt, Min, IsOptional } from 'class-validator';

export class AprobarPlanDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  diasPlazo?: number;
}