import { IsString, IsNotEmpty } from 'class-validator';

export class RechazarPlanDto {
  @IsString()
  @IsNotEmpty()
  motivoRechazo: string;
}