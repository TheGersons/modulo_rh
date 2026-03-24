/**
 * reset-kpis.ts — Limpieza completa de datos operativos
 * Energía PD S.A. de C.V.
 *
 * Borra en orden seguro (respetando foreign keys):
 *   EvidenciaKPI → EvaluacionDetalle → Evaluacion → Alerta
 *   → RevisionJefe → SolicitudEdicion → SolicitudTarea
 *   → Evidencia → Tarea → OrdenTrabajo
 *   → KPI → Puesto → Area (sub-áreas primero, luego padres)
 *
 * NO toca: User, Session, RevisorAsignado
 *
 * Uso:
 *   npx ts-node reset-kpis.ts
 *   -- o con tsx:
 *   npx tsx reset-kpis.ts
 */

import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

// ─── Colores para consola ─────────────────────────────────────────────────────
const R = '\x1b[31m'; // rojo
const G = '\x1b[32m'; // verde
const Y = '\x1b[33m'; // amarillo
const B = '\x1b[34m'; // azul
const W = '\x1b[37m'; // blanco
const X = '\x1b[0m'; // reset

// ─── Confirmación interactiva ─────────────────────────────────────────────────
async function confirmar(pregunta: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(pregunta, (resp) => {
      rl.close();
      resolve(resp.trim().toLowerCase() === 'si');
    });
  });
}

// ─── Contar registros antes del borrado ───────────────────────────────────────
async function contarRegistros() {
  const [
    evidenciasKPI,
    evaluacionDetalles,
    evaluaciones,
    alertas,
    revisionesJefe,
    solicitudesEdicion,
    solicitudesTarea,
    evidencias,
    tareas,
    ordenes,
    kpis,
    puestos,
    areas,
  ] = await Promise.all([
    prisma.evidenciaKPI.count(),
    prisma.evaluacionDetalle.count(),
    prisma.evaluacion.count(),
    prisma.alerta.count(),
    prisma.revisionJefe.count(),
    prisma.solicitudEdicion.count(),
    prisma.solicitudTarea.count(),
    prisma.evidencia.count(),
    prisma.tarea.count(),
    prisma.ordenTrabajo.count(),
    prisma.kPI.count(),
    prisma.puesto.count(),
    prisma.area.count(),
  ]);

  return {
    evidenciasKPI,
    evaluacionDetalles,
    evaluaciones,
    alertas,
    revisionesJefe,
    solicitudesEdicion,
    solicitudesTarea,
    evidencias,
    tareas,
    ordenes,
    kpis,
    puestos,
    areas,
  };
}

// ─── Mostrar resumen ──────────────────────────────────────────────────────────
function mostrarResumen(
  label: string,
  counts: Record<string, number>,
  color: string,
) {
  console.log(`\n${color}${label}${X}`);
  const rows = [
    ['EvidenciaKPI', counts.evidenciasKPI],
    ['EvaluacionDetalle', counts.evaluacionDetalles],
    ['Evaluacion', counts.evaluaciones],
    ['Alerta', counts.alertas],
    ['RevisionJefe', counts.revisionesJefe],
    ['SolicitudEdicion', counts.solicitudesEdicion],
    ['SolicitudTarea', counts.solicitudesTarea],
    ['Evidencia (orden)', counts.evidencias],
    ['Tarea', counts.tareas],
    ['OrdenTrabajo', counts.ordenes],
    ['KPI', counts.kpis],
    ['Puesto', counts.puestos],
    ['Area', counts.areas],
  ];
  for (const [nombre, cant] of rows) {
    const ico = (cant as number) > 0 ? `${Y}●${X}` : `${G}○${X}`;
  }
}

// ─── Borrado principal ────────────────────────────────────────────────────────
async function limpiar() {
  console.log(`\n${B}╔══════════════════════════════════════════════════╗${X}`);
  console.log(`${B}║   RESET DE BASE DE DATOS — ENERGÍA PD            ║${X}`);
  console.log(`${B}╚══════════════════════════════════════════════════╝${X}`);
  console.log(
    `\n${Y}⚠  Este script borrará permanentemente todos los registros operativos.${X}`,
  );
  console.log(`${Y}   Los usuarios NO serán eliminados.${X}\n`);

  // Conteo inicial
  console.log(`${B}Contando registros actuales...${X}`);
  const antes = await contarRegistros();
  mostrarResumen('Registros encontrados:', antes, B);

  const totalAfectado = Object.values(antes).reduce((a, b) => a + b, 0);
  if (totalAfectado === 0) {
    console.log(
      `\n${G}✓ La base de datos ya está limpia. Nada que borrar.${X}\n`,
    );
    return;
  }

  // Confirmación
  console.log(`\n${R}Esto borrará ${totalAfectado} registros en total.${X}`);
  const ok = await confirmar(
    `${R}¿Confirmas? Escribe "si" para continuar: ${X}`,
  );

  if (!ok) {
    console.log(`\n${Y}Operación cancelada. No se borró nada.${X}\n`);
    return;
  }

  // ─── Ejecución en orden seguro ────────────────────────────────────────────
  console.log(`\n${B}Iniciando limpieza...${X}\n`);

  const paso = (n: number, nombre: string, count: number) =>
    console.log(
      `  ${B}[${n}/13]${X} ${nombre.padEnd(28)} ${count > 0 ? `${R}${count} borrados${X}` : `${G}vacío${X}`}`,
    );

  // 1. EvidenciaKPI (depende de KPI, User)
  const r1 = await prisma.evidenciaKPI.deleteMany();
  paso(1, 'EvidenciaKPI', r1.count);

  // 2. EvaluacionDetalle (depende de Evaluacion, KPI)
  const r2 = await prisma.evaluacionDetalle.deleteMany();
  paso(2, 'EvaluacionDetalle', r2.count);

  // 3. Evaluacion (depende de User, Area)
  const r3 = await prisma.evaluacion.deleteMany();
  paso(3, 'Evaluacion', r3.count);

  // 4. Alerta (depende de Area, User, Evaluacion)
  const r4 = await prisma.alerta.deleteMany();
  paso(4, 'Alerta', r4.count);

  // 5. RevisionJefe (depende de OrdenTrabajo, User)
  const r5 = await prisma.revisionJefe.deleteMany();
  paso(5, 'RevisionJefe', r5.count);

  // 6. SolicitudEdicion (depende de OrdenTrabajo, User)
  const r6 = await prisma.solicitudEdicion.deleteMany();
  paso(6, 'SolicitudEdicion', r6.count);

  // 7. SolicitudTarea (depende de OrdenTrabajo, User)
  const r7 = await prisma.solicitudTarea.deleteMany();
  paso(7, 'SolicitudTarea', r7.count);

  // 8. Evidencia (depende de Tarea, cascade)
  const r8 = await prisma.evidencia.deleteMany();
  paso(8, 'Evidencia (órdenes)', r8.count);

  // 9. Tarea (depende de OrdenTrabajo, cascade)
  const r9 = await prisma.tarea.deleteMany();
  paso(9, 'Tarea', r9.count);

  // 10. OrdenTrabajo (depende de KPI, User, Area)
  const r10 = await prisma.ordenTrabajo.deleteMany();
  paso(10, 'OrdenTrabajo', r10.count);

  // 11. KPI (depende de Area, Puesto)
  const r11 = await prisma.kPI.deleteMany();
  paso(11, 'KPI', r11.count);

  // 12. Puesto (depende de Area)
  //     Primero desvinculamos usuarios de su puesto para evitar FK violation
  await prisma.user.updateMany({ data: { puestoId: null } });
  const r12 = await prisma.puesto.deleteMany();
  paso(12, 'Puesto', r12.count);

  // 13. Areas — primero sub-áreas (tienen areaPadreId), luego áreas padre
  //     También desvinculamos usuarios de su área y el jefeId de cada área
  await prisma.user.updateMany({ data: { areaId: null } });
  await prisma.area.updateMany({ data: { jefeId: null } }); // romper self-ref jefe

  // Sub-áreas (tienen areaPadreId)
  const subAreas = await prisma.area.deleteMany({
    where: { areaPadreId: { not: null } },
  });
  // Áreas padre
  const areasPadre = await prisma.area.deleteMany();
  paso(13, 'Area', subAreas.count + areasPadre.count);

  // ─── Verificación final ───────────────────────────────────────────────────
  console.log(`\n${B}Verificando resultado...${X}`);
  const despues = await contarRegistros();
  mostrarResumen('Registros restantes:', despues, G);

  const totalRestante = Object.values(despues).reduce((a, b) => a + b, 0);

  if (totalRestante === 0) {
    console.log(
      `\n${G}✓ Limpieza completada exitosamente. Base de datos lista para nuevo seed.${X}\n`,
    );
  } else {
    console.log(
      `\n${R}⚠ Quedaron ${totalRestante} registros sin borrar. Revisa manualmente.${X}\n`,
    );
  }

  // Recordatorio
  console.log(`${Y}Próximos pasos:${X}`);
  console.log(`  1. Ejecutar seed de áreas y puestos`);
  console.log(`  2. Re-asignar áreas y puestos a usuarios`);
  console.log(`  3. Ejecutar seed de KPIs\n`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────
limpiar()
  .catch((e) => {
    console.error(`\n${R}Error durante la limpieza:${X}`, e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
