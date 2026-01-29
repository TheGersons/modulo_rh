export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: string;
  areaId?: string;
  puesto?: string;
}

export interface Area {
  id: string;
  nombre: string;
  descripcion?: string;
  jefeId: string;
  promedioGlobal?: number;
  totalKpis: number;
  kpisRojos: number;
  porcentajeRojos?: number;
  nivelRiesgo?: string;
  ranking?: number;
  comentarioRRHH?: string;
  accionSugerida?: string;
  activa: boolean;
}

export interface KPI {
  id: string;
  key: string;
  area: string;
  areaId: string;
  puesto?: string;
  indicador: string;
  descripcion?: string;
  formula?: string;
  meta: number;
  tolerancia: number;
  umbralAmarillo?: number;
  periodicidad: string;
  sentido: string;
  unidad?: string;
  activo: boolean;
  orden: number;
}

export interface EvaluacionDetalle {
  id: string;
  kpiId: string;
  kpi?: KPI;
  resultadoNumerico: number;
  meta: number;
  tolerancia: number;
  umbralAmarillo: number;
  sentido: string;
  resultadoPorcentaje: number;
  brechaVsMeta: number;
  estado: 'verde' | 'amarillo' | 'rojo';
  comentarios?: string;
}

export interface Evaluacion {
  id: string;
  empleadoId: string;
  empleado?: User;
  evaluadorId: string;
  evaluador?: User;
  periodo: string;
  tipoPeriodo: 'mensual' | 'trimestral';
  anio: number;
  status: 'borrador' | 'enviada' | 'validada' | 'en_revision';
  promedioGeneral?: number;
  kpisRojos: number;
  porcentajeRojos?: number;
  comentarioGeneral?: string;
  fechaEnvio?: string;
  fechaValidacion?: string;
  detalles?: EvaluacionDetalle[];
}

export interface Validacion {
  id: string;
  evaluacionId: string;
  empleadoId: string;
  status: 'aceptada' | 'revision_solicitada';
  motivoRevision?: string;
  respuestaJefe?: string;
  fechaValidacion: string;
}

export interface Alerta {
  id: string;
  areaId: string;
  area?: Area;
  tipo: string;
  nivel: 'BAJO' | 'MEDIO' | 'ALTO';
  titulo: string;
  descripcion: string;
  accionSugerida?: string;
  responsable?: string;
  status: 'activa' | 'en_proceso' | 'resuelta';
  fechaDeteccion: string;
  fechaResolucion?: string;
}