-- Crear las 6 áreas de la empresa
INSERT INTO "Area" (id, nombre, descripcion, "promedioGlobal", "totalKpis", "kpisRojos", "porcentajeRojos", "nivelRiesgo", ranking, activa, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Gerencia General', 'Dirección estratégica y toma de decisiones', 0, 0, 0, 0, 'BAJO', 0, true, NOW(), NOW()),
  (gen_random_uuid(), 'Administrativa y Contable', 'Gestión administrativa, contable y financiera', 0, 0, 0, 0, 'BAJO', 0, true, NOW(), NOW()),
  (gen_random_uuid(), 'Técnica', 'Operaciones técnicas y mantenimiento', 0, 0, 0, 0, 'BAJO', 0, true, NOW(), NOW()),
  (gen_random_uuid(), 'Comercial', 'Ventas y atención al cliente', 0, 0, 0, 0, 'BAJO', 0, true, NOW(), NOW()),
  (gen_random_uuid(), 'Proyectos', 'Planificación y ejecución de proyectos', 0, 0, 0, 0, 'BAJO', 0, true, NOW(), NOW()),
  (gen_random_uuid(), 'Recursos Humanos', 'Gestión del talento humano', 0, 0, 0, 0, 'BAJO', 0, true, NOW(), NOW());

-- Verificar
SELECT nombre, activa FROM "Area" ORDER BY nombre;