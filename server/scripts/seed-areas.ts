import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAreas() {
  console.log('🌱 Creando estructura de áreas...');

  const areasData = [
    {
      nombre: 'Administrativa',
      descripcion: 'Gestión administrativa, contable y financiera',
      subAreas: [
        'Gerencia',
        'Administración',
        'Flota Vehicular',
        'ISO',
        'SYSO',
        'Contabilidad',
        'Recursos Humanos',
      ],
    },
    {
      nombre: 'Comercial',
      descripcion: 'Ventas y atención al cliente',
      subAreas: [],
    },
    {
      nombre: 'Proyectos',
      descripcion: 'Gestión y ejecución de proyectos',
      subAreas: [],
    },
    {
      nombre: 'Técnica',
      descripcion: 'Operaciones técnicas y mantenimiento',
      subAreas: [],
    },
    {
      nombre: 'Block Chain',
      descripcion: 'Desarrollo e implementación de blockchain',
      subAreas: [],
    },
    {
      nombre: 'Áreas Gerenciales',
      descripcion: 'Dirección estratégica y gerencia general',
      subAreas: [],
    },
  ];

  for (const areaData of areasData) {
    // Verificar si ya existe
    const existente = await prisma.area.findFirst({
      where: { nombre: areaData.nombre, areaPadreId: null },
    });

    if (existente) {
      console.log(`⏭️  "${areaData.nombre}" ya existe, saltando...`);
      continue;
    }

    // Crear área principal
    const areaPrincipal = await prisma.area.create({
      data: {
        nombre: areaData.nombre,
        descripcion: areaData.descripcion,
        activa: true,
      },
    });

    console.log(`✅ Área principal "${areaData.nombre}" creada`);

    // Crear sub-áreas
    for (const subAreaNombre of areaData.subAreas) {
      const existeSubArea = await prisma.area.findFirst({
        where: { nombre: subAreaNombre, areaPadreId: areaPrincipal.id },
      });

      if (existeSubArea) {
        console.log(`  ⏭️  Sub-área "${subAreaNombre}" ya existe`);
        continue;
      }

      await prisma.area.create({
        data: {
          nombre: subAreaNombre,
          descripcion: `Sub-área de ${areaData.nombre}`,
          areaPadreId: areaPrincipal.id,
          activa: true,
        },
      });

      console.log(`  ✅ Sub-área "${subAreaNombre}" creada`);
    }
  }

  console.log('🎉 Estructura de áreas completada');
  await prisma.$disconnect();
}

seedAreas().catch((error) => {
  console.error('❌ Error al crear áreas:', error);
  process.exit(1);
});
