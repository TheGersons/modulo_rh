-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'empleado',
    "areaId" TEXT,
    "puesto" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dni" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "jefeId" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accionSugerida" TEXT,
    "comentarioRRHH" TEXT,
    "kpisRojos" INTEGER NOT NULL DEFAULT 0,
    "nivelRiesgo" TEXT,
    "porcentajeRojos" DOUBLE PRECISION,
    "promedioGlobal" DOUBLE PRECISION,
    "ranking" INTEGER,
    "responsable" TEXT,
    "totalKpis" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPI" (
    "id" TEXT NOT NULL,
    "descripcion" TEXT,
    "areaId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "area" TEXT NOT NULL,
    "formula" TEXT,
    "indicador" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "meta" DOUBLE PRECISION NOT NULL,
    "periodicidad" TEXT NOT NULL,
    "puesto" TEXT,
    "sentido" TEXT NOT NULL,
    "tolerancia" DOUBLE PRECISION NOT NULL,
    "umbralAmarillo" DOUBLE PRECISION,
    "unidad" TEXT,

    CONSTRAINT "KPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluacion" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "evaluadorId" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "tipoPeriodo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'borrador',
    "promedioGeneral" DOUBLE PRECISION,
    "comentarioGeneral" TEXT,
    "fechaEnvio" TIMESTAMP(3),
    "fechaValidacion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kpisRojos" INTEGER NOT NULL DEFAULT 0,
    "porcentajeRojos" DOUBLE PRECISION,

    CONSTRAINT "Evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluacionDetalle" (
    "id" TEXT NOT NULL,
    "evaluacionId" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "comentarios" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brechaVsMeta" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL,
    "meta" DOUBLE PRECISION NOT NULL,
    "resultadoNumerico" DOUBLE PRECISION NOT NULL,
    "resultadoPorcentaje" DOUBLE PRECISION NOT NULL,
    "sentido" TEXT NOT NULL,
    "tolerancia" DOUBLE PRECISION NOT NULL,
    "umbralAmarillo" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EvaluacionDetalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Validacion" (
    "id" TEXT NOT NULL,
    "evaluacionId" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "motivoRevision" TEXT,
    "respuestaJefe" TEXT,
    "fechaValidacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivosAdjuntos" TEXT,
    "detallesRevision" TEXT,

    CONSTRAINT "Validacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alerta" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "accionSugerida" TEXT,
    "responsable" TEXT,
    "status" TEXT NOT NULL DEFAULT 'activa',
    "fechaDeteccion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaResolucion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "empleadoId" TEXT,
    "evaluacionId" TEXT,

    CONSTRAINT "Alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TendenciaArea" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "promedioGeneral" DOUBLE PRECISION NOT NULL,
    "totalKpis" INTEGER NOT NULL,
    "kpisRojos" INTEGER NOT NULL,
    "porcentajeRojos" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TendenciaArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogImportacion" (
    "id" TEXT NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivo" TEXT NOT NULL,
    "registrosImportados" INTEGER NOT NULL,
    "registrosOmitidos" INTEGER NOT NULL,
    "comentariosImportados" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogImportacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanAccion" (
    "id" TEXT NOT NULL,
    "evaluacionId" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "descripcionProblema" TEXT NOT NULL,
    "accionesCorrectivas" TEXT NOT NULL,
    "recursosNecesarios" TEXT,
    "metasEspecificas" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'borrador',
    "motivoRechazo" TEXT,
    "diasPlazo" INTEGER NOT NULL DEFAULT 15,
    "fechaLimite" TIMESTAMP(3),
    "fechaCompletado" TIMESTAMP(3),
    "archivosAdjuntos" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEnvio" TIMESTAMP(3),
    "fechaRevision" TIMESTAMP(3),
    "fechaAprobacion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanAccion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_dni_key" ON "User"("dni");

-- CreateIndex
CREATE INDEX "User_areaId_idx" ON "User"("areaId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Area_nombre_key" ON "Area"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Area_jefeId_key" ON "Area"("jefeId");

-- CreateIndex
CREATE INDEX "Area_jefeId_idx" ON "Area"("jefeId");

-- CreateIndex
CREATE UNIQUE INDEX "KPI_key_key" ON "KPI"("key");

-- CreateIndex
CREATE INDEX "KPI_areaId_idx" ON "KPI"("areaId");

-- CreateIndex
CREATE INDEX "KPI_activo_idx" ON "KPI"("activo");

-- CreateIndex
CREATE INDEX "KPI_key_idx" ON "KPI"("key");

-- CreateIndex
CREATE INDEX "Evaluacion_empleadoId_idx" ON "Evaluacion"("empleadoId");

-- CreateIndex
CREATE INDEX "Evaluacion_evaluadorId_idx" ON "Evaluacion"("evaluadorId");

-- CreateIndex
CREATE INDEX "Evaluacion_periodo_anio_idx" ON "Evaluacion"("periodo", "anio");

-- CreateIndex
CREATE INDEX "Evaluacion_status_idx" ON "Evaluacion"("status");

-- CreateIndex
CREATE INDEX "EvaluacionDetalle_evaluacionId_idx" ON "EvaluacionDetalle"("evaluacionId");

-- CreateIndex
CREATE INDEX "EvaluacionDetalle_kpiId_idx" ON "EvaluacionDetalle"("kpiId");

-- CreateIndex
CREATE INDEX "EvaluacionDetalle_estado_idx" ON "EvaluacionDetalle"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluacionDetalle_evaluacionId_kpiId_key" ON "EvaluacionDetalle"("evaluacionId", "kpiId");

-- CreateIndex
CREATE UNIQUE INDEX "Validacion_evaluacionId_key" ON "Validacion"("evaluacionId");

-- CreateIndex
CREATE INDEX "Validacion_evaluacionId_idx" ON "Validacion"("evaluacionId");

-- CreateIndex
CREATE INDEX "Validacion_empleadoId_idx" ON "Validacion"("empleadoId");

-- CreateIndex
CREATE INDEX "Validacion_status_idx" ON "Validacion"("status");

-- CreateIndex
CREATE INDEX "Alerta_areaId_idx" ON "Alerta"("areaId");

-- CreateIndex
CREATE INDEX "Alerta_empleadoId_idx" ON "Alerta"("empleadoId");

-- CreateIndex
CREATE INDEX "Alerta_evaluacionId_idx" ON "Alerta"("evaluacionId");

-- CreateIndex
CREATE INDEX "Alerta_status_idx" ON "Alerta"("status");

-- CreateIndex
CREATE INDEX "Alerta_nivel_idx" ON "Alerta"("nivel");

-- CreateIndex
CREATE INDEX "TendenciaArea_areaId_idx" ON "TendenciaArea"("areaId");

-- CreateIndex
CREATE INDEX "TendenciaArea_periodo_anio_idx" ON "TendenciaArea"("periodo", "anio");

-- CreateIndex
CREATE UNIQUE INDEX "TendenciaArea_areaId_periodo_anio_key" ON "TendenciaArea"("areaId", "periodo", "anio");

-- CreateIndex
CREATE INDEX "LogImportacion_fechaHora_idx" ON "LogImportacion"("fechaHora");

-- CreateIndex
CREATE INDEX "LogImportacion_estado_idx" ON "LogImportacion"("estado");

-- CreateIndex
CREATE INDEX "Notificacion_userId_idx" ON "Notificacion"("userId");

-- CreateIndex
CREATE INDEX "Notificacion_leida_idx" ON "Notificacion"("leida");

-- CreateIndex
CREATE INDEX "Notificacion_createdAt_idx" ON "Notificacion"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Configuracion_clave_key" ON "Configuracion"("clave");

-- CreateIndex
CREATE INDEX "Configuracion_clave_idx" ON "Configuracion"("clave");

-- CreateIndex
CREATE INDEX "PlanAccion_evaluacionId_idx" ON "PlanAccion"("evaluacionId");

-- CreateIndex
CREATE INDEX "PlanAccion_empleadoId_idx" ON "PlanAccion"("empleadoId");

-- CreateIndex
CREATE INDEX "PlanAccion_kpiId_idx" ON "PlanAccion"("kpiId");

-- CreateIndex
CREATE INDEX "PlanAccion_status_idx" ON "PlanAccion"("status");

-- CreateIndex
CREATE INDEX "PlanAccion_fechaLimite_idx" ON "PlanAccion"("fechaLimite");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_jefeId_fkey" FOREIGN KEY ("jefeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPI" ADD CONSTRAINT "KPI_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_evaluadorId_fkey" FOREIGN KEY ("evaluadorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionDetalle" ADD CONSTRAINT "EvaluacionDetalle_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "Evaluacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionDetalle" ADD CONSTRAINT "EvaluacionDetalle_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KPI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validacion" ADD CONSTRAINT "Validacion_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validacion" ADD CONSTRAINT "Validacion_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "Evaluacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "Evaluacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanAccion" ADD CONSTRAINT "PlanAccion_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanAccion" ADD CONSTRAINT "PlanAccion_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "Evaluacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanAccion" ADD CONSTRAINT "PlanAccion_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KPI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
