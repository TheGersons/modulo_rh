import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function crearPlanesFaltantes() {
  console.log('🔍 Buscando evaluaciones que requieren planes de acción...');

  // Obtener evaluaciones validadas con KPIs rojos
  const evaluaciones = await prisma.evaluacion.findMany({
    where: {
      status: 'validada',
    },
    include: {
      detalles: {
        where: { estado: 'rojo' },
        // CORRECCIÓN 2: Traemos el KPI aquí mismo para tener acceso a su 'key' y 'indicador' siempre
        include: {
          kpi: true 
        }
      },
      empleado: true,
    },
  });

  let planesCreados = 0;

  for (const evaluacion of evaluaciones) {
    if (evaluacion.detalles.length === 0) continue;

    console.log(`\n📋 Evaluación ${evaluacion.periodo} ${evaluacion.anio} - ${evaluacion.empleado.nombre} ${evaluacion.empleado.apellido}`);
    console.log(`   KPIs rojos: ${evaluacion.detalles.length}`);

    for (const detalle of evaluacion.detalles) {
      
      // Verificar si ya existe un plan para este KPI
      const planExistente = await prisma.planAccion.findFirst({
        where: {
          evaluacionId: evaluacion.id,
          kpiId: detalle.kpiId,
        },
        // Nota: Ya no necesitamos include aquí porque usaremos 'detalle.kpi'
      });

      if (!planExistente) {
        // NOTA: Borré el 'prisma.kPI.findUnique' que tenías aquí.
        // Ya no es necesario porque cargamos el KPI en la consulta inicial (línea 17).
        // Usamos 'detalle.kpi' directamente.

        // Crear plan
        await prisma.planAccion.create({
          data: {
            evaluacionId: evaluacion.id,
            empleadoId: evaluacion.empleadoId,
            kpiId: detalle.kpiId,
            // Usamos detalle.kpi (que viene del include inicial)
            descripcionProblema: `KPI en estado rojo: ${detalle.kpi.indicador}. Resultado obtenido: ${detalle.resultadoNumerico}, Meta: ${detalle.meta}`,
            status: 'borrador',
            diasPlazo: 15,
            
            // CORRECCIÓN 1: Agregamos los campos obligatorios con strings vacíos
            accionesCorrectivas: '', 
            metasEspecificas: '',    
          },
        });

        console.log(`   ✅ Plan creado para KPI: ${detalle.kpi.key}`);
        planesCreados++;
      } else {
        // CORRECCIÓN 2 (Uso): Usamos detalle.kpi.key en vez de planExistente.kpi.key
        // 'detalle.kpi' siempre existe gracias al include de la línea 17
        console.log(`   ⏭️  Plan ya existe para KPI: ${detalle.kpi.key}`);
      }
    }
  }

  console.log(`\n✅ Proceso completado. Total de planes creados: ${planesCreados}`);
}

crearPlanesFaltantes()
  .catch((error) => {
    console.error('❌ Error:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });