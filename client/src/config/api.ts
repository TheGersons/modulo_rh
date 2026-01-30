export const API_URL = 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Auth
  login: '/auth/login',

  // Areas
  areas: '/areas',
  areaById: (id: string) => `/areas/${id}`,
  areaEmpleados: (id: string) => `/areas/${id}/empleados`,
  areaKpis: (id: string) => `/areas/${id}/kpis`,
  areaEstadisticas: (id: string) => `/areas/${id}/estadisticas`,
  areaRecalcular: (id: string) => `/areas/${id}/recalcular`,
  areasRecalcularRankings: '/areas/recalcular-rankings',

  // KPIs
  kpis: '/kpis',
  kpiById: (id: string) => `/kpis/${id}`,
  kpisByArea: (areaId: string) => `/kpis/area/${areaId}`,
  kpiEstadisticas: (id: string) => `/kpis/${id}/estadisticas`,

  // Empleados
  empleados: '/empleados',
  empleadoById: (id: string) => `/empleados/${id}`,
  empleadosByArea: (areaId: string) => `/empleados/area/${areaId}`,
  empleadoEstadisticas: (id: string) => `/empleados/${id}/estadisticas`,
  empleadosEstadisticas: '/empleados/estadisticas',
  empleadosSearch: '/empleados/search',

  // Evaluaciones
  evaluaciones: '/evaluaciones',
  evaluacionById: (id: string) => `/evaluaciones/${id}`,
  evaluacionesByEmpleado: (empleadoId: string) => `/evaluaciones/empleado/${empleadoId}`,
  evaluacionesByEvaluador: (evaluadorId: string) => `/evaluaciones/evaluador/${evaluadorId}`,
  evaluacionesByArea: (areaId: string) => `/evaluaciones/area/${areaId}`,
  evaluacionEnviar: (id: string) => `/evaluaciones/${id}/enviar`,

  // Validaciones
  validaciones: '/validaciones',
  validacionByEvaluacion: (evaluacionId: string) => `/validaciones/evaluacion/${evaluacionId}`,
  validacionResponder: (id: string) => `/validaciones/${id}/responder`,

  // Estadísticas
  estadisticasGlobales: '/estadisticas/globales',
  estadisticasArea: (areaId: string) => `/estadisticas/area/${areaId}`,
  estadisticasEmpleado: (empleadoId: string) => `/estadisticas/empleado/${empleadoId}`,
  estadisticasTendencias: '/estadisticas/tendencias',
  estadisticasRankings: '/estadisticas/rankings',

  // Alertas
  alertas: '/alertas',
  alertasActivas: '/alertas/activas',
  alertasGenerarAutomaticas: '/alertas/generar-automaticas',
  alertaResolver: (id: string) => `/alertas/${id}/resolver`,

  // Planes de Acción
  planesAccion: '/planes-accion',
  planAccionById: (id: string) => `/planes-accion/${id}`,
  planesAccionByEmpleado: (empleadoId: string) => `/planes-accion/empleado/${empleadoId}`,
  planesAccionByEvaluacion: (evaluacionId: string) => `/planes-accion/evaluacion/${evaluacionId}`,
  planesAccionCrearAutomaticos: (evaluacionId: string) => `/planes-accion/crear-automaticos/${evaluacionId}`,
  planesAccionPendientesEnvio: '/planes-accion/pendientes-envio',
  planesAccionVencidos: '/planes-accion/vencidos',
  planAccionEnviar: (id: string) => `/planes-accion/${id}/enviar`,
  planAccionAprobar: (id: string) => `/planes-accion/${id}/aprobar`,
  planAccionRechazar: (id: string) => `/planes-accion/${id}/rechazar`,
  planAccionCompletar: (id: string) => `/planes-accion/${id}/completar`,
};