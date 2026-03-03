// server/prisma/diagnostico-seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function diagnostico() {
  console.log('\n🔍 DIAGNÓSTICO DEL SEED\n');

  // 1. Verificar área Administrativa
  const areaAdm = await prisma.area.findFirst({
    where: { nombre: 'Administrativa', areaPadreId: null },
  });
  console.log(
    'Área Administrativa:',
    areaAdm ? `✅ ID: ${areaAdm.id}` : '❌ NO EXISTE',
  );
  if (!areaAdm) {
    await prisma.$disconnect();
    return;
  }

  // 2. Verificar sub-áreas
  const subAreas = [
    'Gerencia',
    'Administración',
    'Flota Vehicular',
    'ISO',
    'SYSO',
    'Contabilidad',
    'Recursos Humanos',
  ];
  const subAreasEncontradas: Record<string, string> = {};

  for (const nombre of subAreas) {
    const sa = await prisma.area.findFirst({
      where: { nombre, areaPadreId: areaAdm.id },
    });
    if (sa) {
      subAreasEncontradas[nombre] = sa.id;
      console.log(`  Sub-área "${nombre}": ✅ ID: ${sa.id}`);
    } else {
      console.log(`  Sub-área "${nombre}": ❌ NO EXISTE`);
    }
  }

  // 3. Verificar puestos por sub-área
  const puestosRequeridos: Record<string, string[]> = {
    Gerencia: ['Gerencia Administrativa'],
    Administración: [
      'Analista Financiero',
      'Encargado de Asuntos Legales',
      'Encargado de Logística',
      'Auxiliar de Mantenimiento Plantel',
    ],
    'Flota Vehicular': ['Encargado de flota vehicular'],
    ISO: ['Oficial ISO', 'Auxiliar ISO'],
    SYSO: ['Oficial de SYSO Unidades de Negocio', 'Oficial de SYSO Proyectos'],
    Contabilidad: [
      'Contador General',
      'Auditor de Viáticos/Inventario',
      'Contador Jr.',
      'Auxiliar Contable',
    ],
    'Recursos Humanos': [
      'Asistente de Recursos Humanos',
      'Encargada de Limpieza',
      'Encargado de Reclutamiento',
      'Generalista de Recursos Humanos',
      'Gestor de Recursos Humanos',
    ],
  };

  console.log('\n📋 PUESTOS:');
  for (const [subAreaNombre, puestos] of Object.entries(puestosRequeridos)) {
    const saId = subAreasEncontradas[subAreaNombre];
    if (!saId) {
      console.log(
        `  [${subAreaNombre}] ⚠️  Sub-área no existe, saltando puestos`,
      );
      continue;
    }
    for (const puestoNombre of puestos) {
      const p = await prisma.puesto.findFirst({
        where: { nombre: puestoNombre, areaId: saId },
      });
      console.log(
        `  [${subAreaNombre}] "${puestoNombre}": ${p ? `✅ ID: ${p.id}` : '❌ NO EXISTE'}`,
      );
    }
  }

  await prisma.$disconnect();
}

diagnostico().catch(console.error);
