import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🗑️ Iniciando BORRADO TOTAL...');

  try {
    // Desactivamos seguridad FK para poder borrar sin importar el orden
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

    // Lista de todas las tablas a borrar
    const tablas = [
      'PlanAccion',
      'EvaluacionDetalle',
      'Validacion',
      'Alerta',
      'Evaluacion',
      'KPI',
      'TendenciaArea',
      'LogImportacion',
      'Configuracion',
      'Notificacion',
      'Area', // Ahora sí borramos las áreas
      'User', // Y los usuarios
    ];

    for (const tabla of tablas) {
      // Usamos executeRaw para ser más rápidos y agresivos (TRUNCATE resetea los IDs autoincrementales si los hubiera, aunque usas UUID)
      // Para UUIDs deleteMany está bien.
      await prisma[tabla].deleteMany();
      console.log(`✅ Tabla ${tabla} eliminada.`);
    }

    // Reactivamos seguridad FK
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
    
    console.log('✨ Base de datos completamente vacía.');

  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();