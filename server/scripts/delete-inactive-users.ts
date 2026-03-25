/**
 * delete-inactive-users.ts
 *
 * Borra todos los usuarios inactivos (activo = false) y todos sus datos relacionados.
 *
 * Uso:
 *   npx ts-node delete-inactive-users.ts
 *
 * O desde el directorio del servidor:
 *   npx ts-node -e "require('./delete-inactive-users')"
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Obtener IDs de usuarios inactivos
  const inactivos = await prisma.user.findMany({
    where: { activo: false },
    select: { id: true, nombre: true, apellido: true, email: true },
  });

  if (inactivos.length === 0) {
    console.log('No hay usuarios inactivos. Nada que borrar.');
    return;
  }

  const ids = inactivos.map((u) => u.id);
  console.log(`\nUsuarios inactivos encontrados (${inactivos.length}):`);
  inactivos.forEach((u, i) =>
    console.log(`  ${i + 1}. ${u.nombre} ${u.apellido} (${u.email})`),
  );

  // Modo dry-run: mostrar y preguntar antes de borrar
  const args = process.argv.slice(2);
  const confirmar = args.includes('--confirmar');

  if (!confirmar) {
    console.log('\n⚠️  Modo previsualización. Para ejecutar el borrado corre:');
    console.log('   npx ts-node delete-inactive-users.ts --confirmar\n');
    return;
  }

  // 2. Borrar en orden correcto (primero hijos, luego padres)
  console.log('\nIniciando borrado...');

  // Sesiones
  const s1 = await prisma.session.deleteMany({
    where: { userId: { in: ids } },
  });
  console.log(`  ✓ Sesiones eliminadas: ${s1.count}`);

  // Revisores asignados (ambas relaciones)
  const s2 = await prisma.revisorAsignado.deleteMany({
    where: { OR: [{ empleadoId: { in: ids } }, { revisorId: { in: ids } }] },
  });
  console.log(`  ✓ Revisores asignados eliminados: ${s2.count}`);

  // EvidenciasKPI
  const s3 = await prisma.evidenciaKPI.deleteMany({
    where: { OR: [{ empleadoId: { in: ids } }, { revisadoPor: { in: ids } }] },
  });
  console.log(`  ✓ Evidencias KPI eliminadas: ${s3.count}`);

  // Alertas del empleado
  const s4 = await prisma.alerta.deleteMany({
    where: { empleadoId: { in: ids } },
  });
  console.log(`  ✓ Alertas eliminadas: ${s4.count}`);

  // Solicitudes de tarea
  const s5 = await prisma.solicitudTarea.deleteMany({
    where: { empleadoId: { in: ids } },
  });
  console.log(`  ✓ Solicitudes de tarea eliminadas: ${s5.count}`);

  // Solicitudes de edición
  const s6 = await prisma.solicitudEdicion.deleteMany({
    where: { solicitanteId: { in: ids } },
  });
  console.log(`  ✓ Solicitudes de edición eliminadas: ${s6.count}`);

  // Revisiones de jefe
  const s7 = await prisma.revisionJefe.deleteMany({
    where: { jefeId: { in: ids } },
  });
  console.log(`  ✓ Revisiones de jefe eliminadas: ${s7.count}`);

  // Órdenes de trabajo recibidas (con cascade a tareas, evidencias, solicitudes, revisiones)
  const s8 = await prisma.ordenTrabajo.deleteMany({
    where: { empleadoId: { in: ids } },
  });
  console.log(`  ✓ Órdenes recibidas eliminadas: ${s8.count}`);

  // Órdenes de trabajo creadas
  const s9 = await prisma.ordenTrabajo.deleteMany({
    where: { creadorId: { in: ids } },
  });
  console.log(`  ✓ Órdenes creadas eliminadas: ${s9.count}`);

  // Detalles de evaluación
  const evalIds = await prisma.evaluacion.findMany({
    where: {
      OR: [{ empleadoId: { in: ids } }, { evaluadorId: { in: ids } }],
    },
    select: { id: true },
  });
  if (evalIds.length > 0) {
    const s10 = await prisma.evaluacionDetalle.deleteMany({
      where: { evaluacionId: { in: evalIds.map((e) => e.id) } },
    });
    console.log(`  ✓ Detalles de evaluación eliminados: ${s10.count}`);
  }

  // Evaluaciones
  const s11 = await prisma.evaluacion.deleteMany({
    where: {
      OR: [{ empleadoId: { in: ids } }, { evaluadorId: { in: ids } }],
    },
  });
  console.log(`  ✓ Evaluaciones eliminadas: ${s11.count}`);

  // Limpiar jefeId en áreas (SetNull — solo por si acaso)
  await prisma.area.updateMany({
    where: { jefeId: { in: ids } },
    data: { jefeId: null },
  });
  console.log('  ✓ Referencias de jefe en áreas limpiadas');

  // 3. Finalmente borrar los usuarios
  const resultado = await prisma.user.deleteMany({
    where: { id: { in: ids } },
  });
  console.log(`\n✅ Usuarios eliminados: ${resultado.count}`);
}

main()
  .catch((e) => {
    console.error('\n❌ Error durante el borrado:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
