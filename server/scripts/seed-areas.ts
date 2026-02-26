import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAreas() {
  console.log('🌱 Creando áreas...');

  const areas = [
    {
      nombre: 'Gerencia General',
      descripcion: 'Dirección estratégica y toma de decisiones',
    },
    {
      nombre: 'Área administrativa',
      descripcion: 'Gestión administrativa, contable y financiera',
    },
    {
      nombre: 'Área técnica',
      descripcion: 'Operaciones técnicas y mantenimiento',
    },
    {
      nombre: 'Área comercial',
      descripcion: 'Ventas y atención al cliente',
    },
    {
      nombre: 'Área de compras internacionales',
      descripcion: 'Gestión de importaciones y compras',
    },
  ];

  for (const area of areas) {
    const areaExistente = await prisma.area.findFirst({
      where: { nombre: area.nombre },
    });

    if (areaExistente) {
      console.log(`⏭️  "${area.nombre}" ya existe, saltando...`);
      continue;
    }

    await prisma.area.create({
      data: {
        nombre: area.nombre,
        descripcion: area.descripcion,
        promedioGlobal: 0,
        totalKpis: 0,
        kpisRojos: 0,
        porcentajeRojos: 0,
        nivelRiesgo: 'BAJO',
        ranking: 0,
        activa: true,
      },
    });

    console.log(`✅ Área "${area.nombre}" creada`);
  }

  console.log('🎉 Áreas creadas exitosamente');
  await prisma.$disconnect();
}

seedAreas().catch((error) => {
  console.error('❌ Error al crear áreas:', error);
  process.exit(1);
});
