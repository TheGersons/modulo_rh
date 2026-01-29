import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed completo del sistema...\n');

  // ============================================
  // 1. LIMPIAR DATOS EXISTENTES (opcional)
  // ============================================
  console.log('🗑️  Limpiando datos existentes...');
  await prisma.logImportacion.deleteMany();
  await prisma.tendenciaArea.deleteMany();
  await prisma.alerta.deleteMany();
  await prisma.validacion.deleteMany();
  await prisma.evaluacionDetalle.deleteMany();
  await prisma.evaluacion.deleteMany();
  await prisma.kPI.deleteMany();
  await prisma.area.deleteMany();
  await prisma.user.deleteMany();
  await prisma.configuracion.deleteMany();
  console.log('✅ Datos limpiados\n');

  // ============================================
  // 2. CREAR USUARIO ADMINISTRADOR Y RRHH
  // ============================================
  console.log('👤 Creando usuarios administrativos...');
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@energiapd.com',
      nombre: 'Administrador',
      dni: '080119900001',
      apellido: 'Sistema',
      password: 'admin123',
      role: 'admin',
      activo: true,
    },
  });

  const rrhh = await prisma.user.create({
    data: {
      email: 'rrhh@energiapd.com',
      nombre: 'Recursos',
      dni: '080119900002',
      apellido: 'Humanos',
      password: 'rrhh123',
      role: 'rrhh',
      activo: true,
    },
  });

  console.log('✅ Admin y RRHH creados\n');

  // ============================================
  // 3. CREAR JEFES
  // ============================================
  console.log('👔 Creando jefes de área...');
  
  const jefesData = [
    { email: 'carlos.mendez@energiapd.com', nombre: 'Carlos', apellido: 'Méndez', area: 'Gerencia' },
    { email: 'ana.garcia@energiapd.com', nombre: 'Ana', apellido: 'García', area: 'Administrativa' },
    { email: 'luis.torres@energiapd.com', nombre: 'Luis', apellido: 'Torres', area: 'Técnica' },
    { email: 'jose.ramirez@energiapd.com', nombre: 'José', apellido: 'Ramírez', area: 'Proyectos' },
    { email: 'maria.lopez@energiapd.com', nombre: 'María', apellido: 'López', area: 'Comercial' },
    { email: 'pedro.martinez@energiapd.com', nombre: 'Pedro', apellido: 'Martínez', area: 'Compras' },
  ];

  const jefesCreados: Array<{ id: string; areaNombre: string }> = [];

  for (const jefe of jefesData) {
    const jefeCreado = await prisma.user.create({
      data: {
        email: jefe.email,
        dni: `0801-${1980 + jefesData.indexOf(jefe)}-0001`, 
        nombre: jefe.nombre,
        apellido: jefe.apellido,
        password: 'jefe123',
        role: 'jefe',
        activo: true,
      },
    });
    jefesCreados.push({ id: jefeCreado.id, areaNombre: jefe.area });
    console.log(`✅ Jefe creado: ${jefe.nombre} ${jefe.apellido} - ${jefe.area}`);
  }

  console.log('');

  // ============================================
  // 4. CREAR ÁREAS
  // ============================================
  console.log('🏢 Creando áreas...');
  
  const areasCreadas: Array<{ id: string; nombre: string }> = [];

  for (const jefe of jefesCreados) {
    const area = await prisma.area.create({
      data: {
        nombre: jefe.areaNombre,
        descripcion: `Área de ${jefe.areaNombre}`,
        jefeId: jefe.id,
        promedioGlobal: 0,
        totalKpis: 0,
        kpisRojos: 0,
        porcentajeRojos: 0,
        nivelRiesgo: 'BAJO',
        ranking: 0,
        activa: true,
      },
    });
    areasCreadas.push({ id: area.id, nombre: area.nombre });

    // Actualizar el areaId del jefe
    await prisma.user.update({
      where: { id: jefe.id },
      data: { areaId: area.id },
    });

    console.log(`✅ Área creada: ${area.nombre}`);
  }

  console.log('');

  // ============================================
  // 5. CREAR EMPLEADOS
  // ============================================
  console.log('👥 Creando empleados...');

  const empleadosData = [
    // Gerencia
    { nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@energiapd.com', puesto: 'Gerente de Operaciones', area: 'Gerencia' },
    { nombre: 'Sandra', apellido: 'Gómez', email: 'sandra.gomez@energiapd.com', puesto: 'Coordinadora', area: 'Gerencia' },

    // Administrativa
    { nombre: 'Miguel', apellido: 'Hernández', email: 'miguel.hernandez@energiapd.com', puesto: 'Gestor de RRHH', area: 'Administrativa' },
    { nombre: 'Patricia', apellido: 'Ruiz', email: 'patricia.ruiz@energiapd.com', puesto: 'Asistente Administrativa', area: 'Administrativa' },

    // Técnica
    { nombre: 'Fernando', apellido: 'Castro', email: 'fernando.castro@energiapd.com', puesto: 'Ingeniero Senior', area: 'Técnica' },
    { nombre: 'Diana', apellido: 'Vargas', email: 'diana.vargas@energiapd.com', puesto: 'Técnico Especialista', area: 'Técnica' },

    // Proyectos
    { nombre: 'Ricardo', apellido: 'Morales', email: 'ricardo.morales@energiapd.com', puesto: 'Líder de Proyecto', area: 'Proyectos' },
    { nombre: 'Gabriela', apellido: 'Reyes', email: 'gabriela.reyes@energiapd.com', puesto: 'Analista de Proyectos', area: 'Proyectos' },

    // Comercial
    { nombre: 'Alberto', apellido: 'Silva', email: 'alberto.silva@energiapd.com', puesto: 'Ejecutivo de Ventas', area: 'Comercial' },
    { nombre: 'Carmen', apellido: 'Ortiz', email: 'carmen.ortiz@energiapd.com', puesto: 'Coordinadora Comercial', area: 'Comercial' },

    // Compras
    { nombre: 'Daniel', apellido: 'Rojas', email: 'daniel.rojas@energiapd.com', puesto: 'Comprador Senior', area: 'Compras' },
    { nombre: 'Elena', apellido: 'Navarro', email: 'elena.navarro@energiapd.com', puesto: 'Analista de Compras', area: 'Compras' },
  ];

  for (const emp of empleadosData) {
    const area = areasCreadas.find(a => a.nombre === emp.area);
    if (area) {
      await prisma.user.create({
        data: {
          email: emp.email,
          dni: `0801-${1990 + empleadosData.indexOf(emp)}-0001`,
          nombre: emp.nombre,
          apellido: emp.apellido,
          password: 'empleado123',
          role: 'empleado',
          puesto: emp.puesto,
          areaId: area.id,
          activo: true,
        },
      });
      console.log(`✅ Empleado creado: ${emp.nombre} ${emp.apellido} - ${emp.area}`);
    }
  }

  console.log('');

  // ============================================
  // 6. CREAR KPIs POR ÁREA
  // ============================================
  console.log('📊 Creando KPIs por área...');

  // KPIs para Gerencia
  const gerenciaArea = areasCreadas.find(a => a.nombre === 'Gerencia');
  if (gerenciaArea) {
    const kpisGerencia = [
      {
        key: 'GER-001',
        area: 'Gerencia',
        indicador: 'Cumplimiento de Objetivos Estratégicos',
        descripcion: 'Porcentaje de objetivos estratégicos cumplidos en el periodo',
        formula: '(Objetivos cumplidos / Total objetivos) * 100',
        meta: 90,
        tolerancia: -5,
        periodicidad: 'trimestral',
        sentido: 'Mayor es mejor',
        unidad: '%',
      },
      {
        key: 'GER-002',
        area: 'Gerencia',
        indicador: 'Satisfacción de Stakeholders',
        descripcion: 'Nivel de satisfacción de partes interesadas',
        formula: 'Promedio de encuestas de satisfacción',
        meta: 85,
        tolerancia: -5,
        periodicidad: 'trimestral',
        sentido: 'Mayor es mejor',
        unidad: '%',
      },
      {
        key: 'GER-003',
        area: 'Gerencia',
        indicador: 'ROI de Proyectos',
        descripcion: 'Retorno de inversión de proyectos ejecutados',
        formula: '((Beneficio - Inversión) / Inversión) * 100',
        meta: 20,
        tolerancia: -5,
        periodicidad: 'trimestral',
        sentido: 'Mayor es mejor',
        unidad: '%',
      },
    ];

    for (const [index, kpi] of kpisGerencia.entries()) {
      await prisma.kPI.create({
        data: {
          ...kpi,
          areaId: gerenciaArea.id,
          umbralAmarillo: kpi.meta + kpi.tolerancia,
          orden: index + 1,
          activo: true,
        },
      });
    }
    console.log(`✅ ${kpisGerencia.length} KPIs creados para Gerencia`);
  }

  // KPIs para Administrativa
  const administrativaArea = areasCreadas.find(a => a.nombre === 'Administrativa');
  if (administrativaArea) {
    const kpisAdministrativa = [
      {
        key: 'ADM-001',
        area: 'Administrativa',
        puesto: 'Gestor de RRHH',
        indicador: 'Tiempo de Reclutamiento',
        descripcion: 'Días promedio para completar un proceso de reclutamiento',
        formula: 'Promedio de días desde publicación hasta contratación',
        meta: 30,
        tolerancia: 5,
        periodicidad: 'mensual',
        sentido: 'Menor es mejor',
        unidad: 'días',
      },
      {
        key: 'ADM-002',
        area: 'Administrativa',
        indicador: 'Cumplimiento de Nómina',
        descripcion: 'Porcentaje de nóminas procesadas sin errores',
        formula: '(Nóminas correctas / Total nóminas) * 100',
        meta: 98,
        tolerancia: -2,
        periodicidad: 'mensual',
        sentido: 'Mayor es mejor',
        unidad: '%',
      },
      {
        key: 'ADM-003',
        area: 'Administrativa',
        indicador: 'Satisfacción de Empleados',
        descripcion: 'Índice de satisfacción laboral',
        formula: 'Promedio de encuestas de clima laboral',
        meta: 80,
        tolerancia: -5,
        periodicidad: 'trimestral',
        sentido: 'Mayor es mejor',
        unidad: '%',
      },
    ];

    for (const [index, kpi] of kpisAdministrativa.entries()) {
      await prisma.kPI.create({
        data: {
          ...kpi,
          areaId: administrativaArea.id,
          umbralAmarillo: kpi.sentido === 'Mayor es mejor' 
            ? kpi.meta + kpi.tolerancia 
            : kpi.meta - kpi.tolerancia,
          orden: index + 1,
          activo: true,
        },
      });
    }
    console.log(`✅ ${kpisAdministrativa.length} KPIs creados para Administrativa`);
  }

  // KPIs para Técnica
  const tecnicaArea = areasCreadas.find(a => a.nombre === 'Técnica');
  if (tecnicaArea) {
    const kpisTecnica = [
      {
        key: 'TEC-001',
        area: 'Técnica',
        indicador: 'Tiempo de Respuesta a Incidencias',
        descripcion: 'Tiempo promedio de respuesta a incidencias técnicas',
        formula: 'Promedio de horas desde reporte hasta primera respuesta',
        meta: 4,
        tolerancia: 2,
        periodicidad: 'mensual',
        sentido: 'Menor es mejor',
        unidad: 'horas',
      },
      {
        key: 'TEC-002',
        area: 'Técnica',
        indicador: 'Disponibilidad de Sistemas',
        descripcion: 'Porcentaje de uptime de sistemas críticos',
        formula: '(Tiempo operativo / Tiempo total) * 100',
        meta: 99,
        tolerancia: -1,
        periodicidad: 'mensual',
        sentido: 'Mayor es mejor',
        unidad: '%',
      },
      {
        key: 'TEC-003',
        area: 'Técnica',
        indicador: 'Cumplimiento de Mantenimientos',
        descripcion: 'Porcentaje de mantenimientos ejecutados según plan',
        formula: '(Mantenimientos realizados / Mantenimientos planificados) * 100',
        meta: 95,
        tolerancia: -5,
        periodicidad: 'mensual',
        sentido: 'Mayor es mejor',
        unidad: '%',
      },
    ];

    for (const [index, kpi] of kpisTecnica.entries()) {
      await prisma.kPI.create({
        data: {
          ...kpi,
          areaId: tecnicaArea.id,
          umbralAmarillo: kpi.sentido === 'Mayor es mejor' 
            ? kpi.meta + kpi.tolerancia 
            : kpi.meta - kpi.tolerancia,
          orden: index + 1,
          activo: true,
        },
      });
    }
    console.log(`✅ ${kpisTecnica.length} KPIs creados para Técnica`);
  }

  // KPIs para Proyectos
  const proyectosArea = areasCreadas.find(a => a.nombre === 'Proyectos');
  if (proyectosArea) {
    const kpisProyectos = [
      {
        key: 'PRY-001',
        area: 'Proyectos',
        indicador: 'Cumplimiento de Plazos',
        descripcion: 'Porcentaje de proyectos entregados a tiempo',
        formula: '(Proyectos a tiempo / Total proyectos) * 100',
        meta: 90,
        tolerancia: -5,
        periodicidad: 'mensual',
        sentido: 'Mayor es mejor',
        unidad: '%',
      },
      {
        key: 'PRY-002',
        area: 'Proyectos',
        indicador: 'Cumplimiento de Presupuesto',
        descripcion: 'Porcentaje de proyectos dentro del presupuesto',
        formula: '(Proyectos en presupuesto / Total proyectos) * 100',
        meta: 85,
        tolerancia: -5,
        periodicidad: 'mensual',
        sentido: 'Mayor es mejor',
        unidad: '%',
      },
      {
        key: 'PRY-003',
        area: 'Proyectos',
        indicador: 'Satisfacción del Cliente',
        descripcion: 'Índice de satisfacción del cliente en proyectos',
        formula: 'Promedio de encuestas post-proyecto',
        meta: 90,
        tolerancia: -5,
        periodicidad: 'trimestral',
        sentido: 'Mayor es mejor',
        unidad: '%',
      },
    ];

    for (const [index, kpi] of kpisProyectos.entries()) {
      await prisma.kPI.create({
        data: {
          ...kpi,
          areaId: proyectosArea.id,
          umbralAmarillo: kpi.meta + kpi.tolerancia,
          orden: index + 1,
          activo: true,
        },
      });
    }
    console.log(`✅ ${kpisProyectos.length} KPIs creados para Proyectos`);
  }

  // KPIs para Comercial
  const comercialArea = areasCreadas.find(a => a.nombre === 'Comercial');
  if (comercialArea) {
    const kpisComercial = [
      {
        key: 'COM-001',
        area: 'Comercial',
        indicador: 'Cumplimiento de Cuota de Ventas',
        descripcion: 'Porcentaje de cumplimiento de cuota mensual',
        formula: '(Ventas reales / Cuota de ventas) * 100',
        meta: 100,
        tolerancia: -10,
        periodicidad: 'mensual',
        sentido: 'Mayor es mejor',
        unidad: '%',
      },
      {
        key: 'COM-002',
        area: 'Comercial',
        indicador: 'Tasa de Conversión',
        descripcion: 'Porcentaje de prospectos convertidos en clientes',
        formula: '(Clientes nuevos / Prospectos) * 100',
        meta: 25,
        tolerancia: -5,
        periodicidad: 'mensual',
        sentido: 'Mayor es mejor',
        unidad: '%',
      },
      {
        key: 'COM-003',
        area: 'Comercial',
        indicador: 'Retención de Clientes',
        descripcion: 'Porcentaje de clientes que renuevan',
        formula: '(Clientes retenidos / Total clientes) * 100',
        meta: 85,
        tolerancia: -5,
        periodicidad: 'trimestral',
        sentido: 'Mayor es mejor',
        unidad: '%',
      },
    ];

    for (const [index, kpi] of kpisComercial.entries()) {
      await prisma.kPI.create({
        data: {
          ...kpi,
          areaId: comercialArea.id,
          umbralAmarillo: kpi.meta + kpi.tolerancia,
          orden: index + 1,
          activo: true,
        },
      });
    }
    console.log(`✅ ${kpisComercial.length} KPIs creados para Comercial`);
  }

  // KPIs para Compras
  const comprasArea = areasCreadas.find(a => a.nombre === 'Compras');
  if (comprasArea) {
    const kpisCompras = [
      {
        key: 'CMP-001',
        area: 'Compras',
        indicador: 'Ahorro en Compras',
        descripcion: 'Porcentaje de ahorro vs presupuesto de compras',
        formula: '((Presupuesto - Gasto real) / Presupuesto) * 100',
        meta: 10,
        tolerancia: -3,
        periodicidad: 'mensual',
        sentido: 'Mayor es mejor',
        unidad: '%',
      },
      {
        key: 'CMP-002',
        area: 'Compras',
        indicador: 'Cumplimiento de Proveedores',
        descripcion: 'Porcentaje de entregas a tiempo por proveedores',
        formula: '(Entregas a tiempo / Total entregas) * 100',
        meta: 95,
        tolerancia: -5,
        periodicidad: 'mensual',
        sentido: 'Mayor es mejor',
        unidad: '%',
      },
      {
        key: 'CMP-003',
        area: 'Compras',
        indicador: 'Tiempo de Ciclo de Compra',
        descripcion: 'Días promedio desde solicitud hasta entrega',
        formula: 'Promedio de días del proceso completo',
        meta: 15,
        tolerancia: 5,
        periodicidad: 'mensual',
        sentido: 'Menor es mejor',
        unidad: 'días',
      },
    ];

    for (const [index, kpi] of kpisCompras.entries()) {
      await prisma.kPI.create({
        data: {
          ...kpi,
          areaId: comprasArea.id,
          umbralAmarillo: kpi.sentido === 'Mayor es mejor' 
            ? kpi.meta + kpi.tolerancia 
            : kpi.meta - kpi.tolerancia,
          orden: index + 1,
          activo: true,
        },
      });
    }
    console.log(`✅ ${kpisCompras.length} KPIs creados para Compras`);
  }

  console.log('');

  // ============================================
  // 7. CREAR EVALUACIONES DE EJEMPLO
  // ============================================
  console.log('📝 Creando evaluaciones de ejemplo...');

  // Obtener un empleado y su jefe
  const empleadoEjemplo = await prisma.user.findFirst({
    where: { email: 'juan.perez@energiapd.com' },
  });

  const jefeEjemplo = await prisma.user.findFirst({
    where: { email: 'carlos.mendez@energiapd.com' },
  });

  if (empleadoEjemplo && jefeEjemplo && gerenciaArea) {
    // Obtener KPIs del área
    const kpisGerencia = await prisma.kPI.findMany({
      where: { areaId: gerenciaArea.id },
    });

    // Crear evaluación Q4 2025 (validada)
    const evaluacionQ4 = await prisma.evaluacion.create({
      data: {
        empleadoId: empleadoEjemplo.id,
        evaluadorId: jefeEjemplo.id,
        periodo: 'Q4',
        tipoPeriodo: 'trimestral',
        anio: 2025,
        status: 'validada',
        promedioGeneral: 92,
        kpisRojos: 0,
        porcentajeRojos: 0,
        comentarioGeneral: 'Excelente desempeño durante el trimestre. Cumplió todos los objetivos estratégicos.',
        fechaEnvio: new Date('2025-12-20'),
        fechaValidacion: new Date('2025-12-22'),
      },
    });

    // Crear detalles de evaluación Q4
    for (const kpi of kpisGerencia) {
      const resultadoNumerico = 92 + Math.random() * 8; // Entre 92 y 100
      const resultadoPorcentaje = (resultadoNumerico / kpi.meta) * 100;
      const brechaVsMeta = resultadoNumerico - kpi.meta;
      
      let estado = 'verde';
      if (resultadoNumerico < kpi.umbralAmarillo!) {
        estado = 'amarillo';
      }
      if (resultadoNumerico < (kpi.meta - Math.abs(kpi.tolerancia) * 2)) {
        estado = 'rojo';
      }

      await prisma.evaluacionDetalle.create({
        data: {
          evaluacionId: evaluacionQ4.id,
          kpiId: kpi.id,
          resultadoNumerico,
          meta: kpi.meta,
          tolerancia: kpi.tolerancia,
          umbralAmarillo: kpi.umbralAmarillo!,
          sentido: kpi.sentido,
          resultadoPorcentaje,
          brechaVsMeta,
          estado,
          comentarios: `Resultado ${estado === 'verde' ? 'excelente' : 'bueno'} en este indicador.`,
        },
      });
    }

    // Crear validación
    await prisma.validacion.create({
      data: {
        evaluacionId: evaluacionQ4.id,
        empleadoId: empleadoEjemplo.id,
        status: 'aceptada',
        fechaValidacion: new Date('2025-12-22'),
      },
    });

    console.log('✅ Evaluación Q4 2025 creada y validada');

    // Crear evaluación Q1 2026 (pendiente de validación)
    const evaluacionQ1 = await prisma.evaluacion.create({
      data: {
        empleadoId: empleadoEjemplo.id,
        evaluadorId: jefeEjemplo.id,
        periodo: 'Q1',
        tipoPeriodo: 'trimestral',
        anio: 2026,
        status: 'enviada',
        promedioGeneral: 87.5,
        kpisRojos: 0,
        porcentajeRojos: 0,
        comentarioGeneral: 'Buen desempeño general. Se recomienda mejorar en algunos aspectos operativos.',
        fechaEnvio: new Date('2026-03-15'),
      },
    });

    // Crear detalles de evaluación Q1
    for (const kpi of kpisGerencia) {
      const resultadoNumerico = 85 + Math.random() * 10; // Entre 85 y 95
      const resultadoPorcentaje = (resultadoNumerico / kpi.meta) * 100;
      const brechaVsMeta = resultadoNumerico - kpi.meta;
      
      let estado = 'verde';
      if (resultadoNumerico < kpi.umbralAmarillo!) {
        estado = 'amarillo';
      }
      if (resultadoNumerico < (kpi.meta - Math.abs(kpi.tolerancia) * 2)) {
        estado = 'rojo';
      }

      await prisma.evaluacionDetalle.create({
        data: {
          evaluacionId: evaluacionQ1.id,
          kpiId: kpi.id,
          resultadoNumerico,
          meta: kpi.meta,
          tolerancia: kpi.tolerancia,
          umbralAmarillo: kpi.umbralAmarillo!,
          sentido: kpi.sentido,
          resultadoPorcentaje,
          brechaVsMeta,
          estado,
          comentarios: `Desempeño ${estado === 'verde' ? 'satisfactorio' : 'mejorable'}.`,
        },
      });
    }

    console.log('✅ Evaluación Q1 2026 creada (pendiente de validación)');
  }

  console.log('');

  // ============================================
  // 8. CREAR CONFIGURACIONES
  // ============================================
  console.log('⚙️  Creando configuraciones...');

  const configuraciones = [
    { clave: 'escala_minima', valor: '0' },
    { clave: 'escala_maxima', valor: '100' },
    { clave: 'periodos_activos', valor: 'mensual,trimestral' },
    { clave: 'anio_actual', valor: '2026' },
    { clave: 'umbral_rojo_porcentaje', valor: '30' }, // % de KPIs rojos para considerar área en riesgo
    { clave: 'sistema_version', valor: '2.0' },
  ];

  for (const config of configuraciones) {
    await prisma.configuracion.create({
      data: config,
    });
  }

  console.log('✅ Configuraciones creadas\n');

  // ============================================
  // RESUMEN FINAL
  // ============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 SEED COMPLETADO EXITOSAMENTE\n');
  console.log('📋 CREDENCIALES:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🔑 ADMINISTRADOR:');
  console.log('   Email: admin@energiapd.com');
  console.log('   Password: admin123');
  console.log('\n👔 RECURSOS HUMANOS:');
  console.log('   Email: rrhh@energiapd.com');
  console.log('   Password: rrhh123');
  console.log('\n👨‍💼 JEFES (todos usan password: jefe123):');
  console.log('   • carlos.mendez@energiapd.com - Gerencia');
  console.log('   • ana.garcia@energiapd.com - Administrativa');
  console.log('   • luis.torres@energiapd.com - Técnica');
  console.log('   • jose.ramirez@energiapd.com - Proyectos');
  console.log('   • maria.lopez@energiapd.com - Comercial');
  console.log('   • pedro.martinez@energiapd.com - Compras');
  console.log('\n👥 EMPLEADOS (todos usan password: empleado123):');
  console.log('   • juan.perez@energiapd.com');
  console.log('   • miguel.hernandez@energiapd.com');
  console.log('   • fernando.castro@energiapd.com');
  console.log('   • ... (y más)');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });