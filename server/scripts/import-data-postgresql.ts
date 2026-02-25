import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function importData() {
  console.log('📥 Importando datos a PostgreSQL...');

  const data = JSON.parse(fs.readFileSync('backup_data.json', 'utf-8'));

  try {
    // ========================================
    // FASE 1: Crear sin relaciones circulares
    // ========================================

    // 1. Áreas SIN jefeId
    console.log('Importando áreas (sin jefes)...');
    for (const area of data.areas) {
      // Extraer solo los campos que existen en tu schema
      const areaData: any = {
        id: area.id,
        nombre: area.nombre,
        descripcion: area.descripcion,
        promedioGlobal: area.promedioGlobal || 0,
        totalKpis: area.totalKpis || 0,
        kpisRojos: area.kpisRojos || 0,
        porcentajeRojos: area.porcentajeRojos || 0,
        nivelRiesgo: area.nivelRiesgo || 'BAJO',
        ranking: area.ranking || 0,
        activa: area.activa !== false,
        createdAt: area.createdAt,
        updatedAt: area.updatedAt,
        jefeId: null, // Temporal
      };

      // Agregar campos opcionales si existen en tu schema
      if ('comentarioRRHH' in area)
        areaData.comentarioRRHH = area.comentarioRRHH;
      if ('accionSugerida' in area)
        areaData.accionSugerida = area.accionSugerida;
      if ('responsable' in area) areaData.responsable = area.responsable;

      await prisma.area.create({ data: areaData });
    }

    // 2. Usuarios
    console.log('Importando usuarios...');
    for (const user of data.users) {
      const userData: any = {
        id: user.id,
        dni: user.dni,
        email: user.email,
        password: user.password,
        nombre: user.nombre,
        apellido: user.apellido,
        role: user.role || 'empleado',
        areaId: user.areaId,
        puesto: user.puesto,
        activo: user.activo !== false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      await prisma.user.create({ data: userData });
    }

    // ========================================
    // FASE 2: Actualizar relaciones
    // ========================================

    // 3. Actualizar jefeId en Áreas
    console.log('Asignando jefes a áreas...');
    for (const area of data.areas) {
      if (area.jefeId) {
        await prisma.area.update({
          where: { id: area.id },
          data: { jefeId: area.jefeId },
        });
      }
    }

    // ========================================
    // FASE 3: Resto de datos
    // ========================================

    // 4. KPIs
    console.log('Importando KPIs...');
    if (data.kpis && data.kpis.length > 0) {
      for (const kpi of data.kpis) {
        await prisma.kPI.create({ data: kpi });
      }
    }

    // 5. Evaluaciones con detalles
    console.log('Importando evaluaciones...');
    if (data.evaluaciones && data.evaluaciones.length > 0) {
      for (const evaluacion of data.evaluaciones) {
        const { detalles, ...evalData } = evaluacion;

        const evalCreated = await prisma.evaluacion.create({
          data: evalData,
        });

        // Crear detalles
        if (detalles && detalles.length > 0) {
          for (const detalle of detalles) {
            await prisma.evaluacionDetalle.create({
              data: {
                ...detalle,
                evaluacionId: evalCreated.id,
              },
            });
          }
        }
      }
    }

    // 6. Validaciones
    if (data.validaciones && data.validaciones.length > 0) {
      console.log('Importando validaciones...');
      for (const validacion of data.validaciones) {
        await prisma.validacion.create({ data: validacion });
      }
    }

    // 7. Alertas
    if (data.alertas && data.alertas.length > 0) {
      console.log('Importando alertas...');
      for (const alerta of data.alertas) {
        await prisma.alerta.create({ data: alerta });
      }
    }

    // 8. Planes de Acción
    if (data.planesAccion && data.planesAccion.length > 0) {
      console.log('Importando planes de acción...');
      for (const plan of data.planesAccion) {
        await prisma.planAccion.create({ data: plan });
      }
    }

    console.log('\n✅ Importación completada!');

    // Verificar
    console.log('\n📊 Verificación:');
    console.log(`- Áreas: ${await prisma.area.count()}`);
    console.log(`- Usuarios: ${await prisma.user.count()}`);
    console.log(`- KPIs: ${await prisma.kPI.count()}`);

    const evaluacionCount = await prisma.evaluacion.count();
    const detalleCount = await prisma.evaluacionDetalle.count();
    console.log(`- Evaluaciones: ${evaluacionCount}`);
    console.log(`- Detalles: ${detalleCount}`);

    const validacionCount = await prisma.validacion.count();
    console.log(`- Validaciones: ${validacionCount}`);

    const alertaCount = await prisma.alerta.count();
    console.log(`- Alertas: ${alertaCount}`);

    const planCount = await prisma.planAccion.count();
    console.log(`- Planes: ${planCount}`);
  } catch (error) {
    console.error('❌ Error durante importación:', error);
  }
}

importData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
