import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function exportData() {
  console.log('📦 Exportando datos de MySQL...');

  const data = {
    areas: await prisma.area.findMany(),
    users: await prisma.user.findMany(),
    kpis: await prisma.kPI.findMany(),
    evaluaciones: await prisma.evaluacion.findMany({
      include: { detalles: true },
    }),
    validaciones: await prisma.validacion.findMany(),
    alertas: await prisma.alerta.findMany(),
    planesAccion: await prisma.planAccion.findMany(),
  };

  fs.writeFileSync('backup_data.json', JSON.stringify(data, null, 2));
  console.log('✅ Datos exportados a backup_data.json');

  // Stats
  console.log('\n📊 Resumen:');
  console.log(`- Áreas: ${data.areas.length}`);
  console.log(`- Usuarios: ${data.users.length}`);
  console.log(`- KPIs: ${data.kpis.length}`);
  console.log(`- Evaluaciones: ${data.evaluaciones.length}`);
  console.log(`- Validaciones: ${data.validaciones.length}`);
  console.log(`- Alertas: ${data.alertas.length}`);
  console.log(`- Planes de Acción: ${data.planesAccion.length}`);
}

exportData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
