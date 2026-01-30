-- Script para generar alertas de planes de acción pendientes
-- Ejecutar manualmente o mediante cron job

-- 1. Alertas para planes en borrador que no se han enviado en 3 días
INSERT INTO "Alerta" (
  id,
  "areaId",
  "empleadoId",
  "evaluacionId",
  tipo,
  nivel,
  titulo,
  descripcion,
  "accionSugerida",
  status,
  "fechaDeteccion",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  e."areaId",
  pa."empleadoId",
  pa."evaluacionId",
  'kpi_critico',
  'ALTO',
  'Plan de Acción sin enviar',
  CONCAT(
    'El plan de acción para el KPI "',
    k.indicador,
    '" fue creado hace ',
    EXTRACT(DAY FROM (NOW() - pa."fechaCreacion")),
    ' días y aún no ha sido enviado para revisión.'
  ),
  'Contactar al empleado para completar y enviar el plan de acción',
  'activa',
  NOW(),
  NOW(),
  NOW()
FROM "PlanAccion" pa
INNER JOIN "KPI" k ON pa."kpiId" = k.id
INNER JOIN "User" e ON pa."empleadoId" = e.id
WHERE pa.status = 'borrador'
  AND pa."fechaCreacion" < (NOW() - INTERVAL '3 days')
  AND NOT EXISTS (
    SELECT 1 FROM "Alerta" a
    WHERE a."empleadoId" = pa."empleadoId"
      AND a.tipo = 'kpi_critico'
      AND a.status IN ('activa', 'en_proceso')
      AND a.titulo = 'Plan de Acción sin enviar'
  );

-- 2. Alertas para planes vencidos (en_progreso con fecha límite pasada)
INSERT INTO "Alerta" (
  id,
  "areaId",
  "empleadoId",
  "evaluacionId",
  tipo,
  nivel,
  titulo,
  descripcion,
  "accionSugerida",
  status,
  "fechaDeteccion",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  e."areaId",
  pa."empleadoId",
  pa."evaluacionId",
  'tendencia_negativa',
  'ALTO',
  'Plan de Acción vencido',
  CONCAT(
    'El plan de acción para el KPI "',
    k.indicador,
    '" venció hace ',
    EXTRACT(DAY FROM (NOW() - pa."fechaLimite")),
    ' días sin completarse.'
  ),
  'Revisar urgentemente el estado del plan con el empleado y su jefe',
  'activa',
  NOW(),
  NOW(),
  NOW()
FROM "PlanAccion" pa
INNER JOIN "KPI" k ON pa."kpiId" = k.id
INNER JOIN "User" e ON pa."empleadoId" = e.id
WHERE pa.status = 'en_progreso'
  AND pa."fechaLimite" < NOW()
  AND NOT EXISTS (
    SELECT 1 FROM "Alerta" a
    WHERE a."empleadoId" = pa."empleadoId"
      AND a.tipo = 'tendencia_negativa'
      AND a.status IN ('activa', 'en_proceso')
      AND a.titulo = 'Plan de Acción vencido'
  );

-- 3. Verificar qué evaluaciones requieren planes de acción actualmente
SELECT
  e.id AS evaluacion_id,
  e.periodo,
  e.anio,
  u.nombre || ' ' || u.apellido AS empleado,
  a.nombre AS area,
  COUNT(ed.id) AS kpis_rojos,
  COUNT(pa.id) AS planes_creados,
  COUNT(ed.id) - COUNT(pa.id) AS planes_faltantes
FROM "Evaluacion" e
INNER JOIN "User" u ON e."empleadoId" = u.id
INNER JOIN "Area" a ON u."areaId" = a.id
INNER JOIN "EvaluacionDetalle" ed ON e.id = ed."evaluacionId"
LEFT JOIN "PlanAccion" pa ON e.id = pa."evaluacionId" AND ed."kpiId" = pa."kpiId"
WHERE e.status = 'validada'
  AND ed.estado = 'rojo'
GROUP BY e.id, e.periodo, e.anio, u.nombre, u.apellido, a.nombre
HAVING COUNT(ed.id) > COUNT(pa.id)
ORDER BY e.anio DESC, e.periodo DESC;