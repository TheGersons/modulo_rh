import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class CalcularKpiDto {
  @IsString()
  @IsNotEmpty()
  kpiId: string;

  @IsObject()
  valores: Record<string, any>; // Valores dinámicos según la fórmula
  // Ejemplo: { "gasto_real": 95000, "presupuesto_aprobado": 100000 }
}
