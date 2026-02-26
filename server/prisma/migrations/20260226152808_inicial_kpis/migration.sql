-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "dni" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'empleado',
    "areaId" TEXT,
    "puesto" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "jefeId" TEXT,
    "promedioGlobal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalKpis" INTEGER NOT NULL DEFAULT 0,
    "kpisRojos" INTEGER NOT NULL DEFAULT 0,
    "porcentajeRojos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nivelRiesgo" TEXT NOT NULL DEFAULT 'BAJO',
    "ranking" INTEGER NOT NULL DEFAULT 0,
    "comentarioRRHH" TEXT,
    "accionSugerida" TEXT,
    "responsable" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPI" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "puesto" TEXT,
    "indicador" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipoCalculo" TEXT NOT NULL,
    "formulaCalculo" TEXT NOT NULL,
    "meta" DOUBLE PRECISION,
    "tolerancia" DOUBLE PRECISION,
    "umbralAmarillo" DOUBLE PRECISION,
    "periodicidad" TEXT NOT NULL,
    "sentido" TEXT NOT NULL,
    "unidad" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenTrabajo" (
    "id" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "creadorId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidadTareas" INTEGER NOT NULL,
    "tipoOrden" TEXT NOT NULL DEFAULT 'kpi_sistema',
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLimite" TIMESTAMP(3) NOT NULL,
    "fechaLimiteOriginal" TIMESTAMP(3),
    "fechaExtendida" TIMESTAMP(3),
    "motivoExtension" TEXT,
    "fechaCompletada" TIMESTAMP(3),
    "enPausa" BOOLEAN NOT NULL DEFAULT false,
    "motivoPausa" TEXT,
    "fechaPausa" TIMESTAMP(3),
    "requiereAprobacion" BOOLEAN NOT NULL DEFAULT false,
    "tareasCompletadas" INTEGER NOT NULL DEFAULT 0,
    "progreso" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "resultadoFinal" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdenTrabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarea" (
    "id" TEXT NOT NULL,
    "ordenTrabajoId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "fueraDeTiempo" BOOLEAN NOT NULL DEFAULT false,
    "fechaLimite" TIMESTAMP(3),
    "fechaCompletada" TIMESTAMP(3),
    "solicitudAgregar" BOOLEAN NOT NULL DEFAULT false,
    "aprobadaPorJefe" BOOLEAN NOT NULL DEFAULT false,
    "intentosEvidencia" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidencia" (
    "id" TEXT NOT NULL,
    "tareaId" TEXT NOT NULL,
    "archivoUrl" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tamanio" INTEGER,
    "intento" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'pendiente_revision',
    "motivoRechazo" TEXT,
    "esFueraDeTiempo" BOOLEAN NOT NULL DEFAULT false,
    "apelacion" TEXT,
    "respuestaApelacion" TEXT,
    "fechaApelacion" TIMESTAMP(3),
    "fechaSubida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evidencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudTarea" (
    "id" TEXT NOT NULL,
    "ordenTrabajoId" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "justificacion" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "motivoRechazo" TEXT,
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaRespuesta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitudTarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudEdicion" (
    "id" TEXT NOT NULL,
    "ordenTrabajoId" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "campoAEditar" TEXT NOT NULL,
    "valorActual" TEXT NOT NULL,
    "valorNuevo" TEXT NOT NULL,
    "justificacion" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "motivoRechazo" TEXT,
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaRespuesta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitudEdicion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisionJefe" (
    "id" TEXT NOT NULL,
    "ordenTrabajoId" TEXT NOT NULL,
    "jefeId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "motivoRechazo" TEXT,
    "comentarios" TEXT,
    "calificacion" INTEGER,
    "fechaRevision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevisionJefe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluacion" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "evaluadorId" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "tipoPeriodo" TEXT,
    "anio" INTEGER NOT NULL,
    "calculadaAutomaticamente" BOOLEAN NOT NULL DEFAULT true,
    "promedioGeneral" DOUBLE PRECISION,
    "kpisRojos" INTEGER NOT NULL DEFAULT 0,
    "porcentajeRojos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'borrador',
    "fechaCalculo" TIMESTAMP(3),
    "fechaCierre" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluacionDetalle" (
    "id" TEXT NOT NULL,
    "evaluacionId" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "ordenTrabajoId" TEXT,
    "resultadoNumerico" DOUBLE PRECISION NOT NULL,
    "resultadoPorcentaje" DOUBLE PRECISION,
    "brechaVsMeta" DOUBLE PRECISION,
    "estado" TEXT,
    "formulaUtilizada" TEXT,
    "meta" DOUBLE PRECISION,
    "umbralAmarillo" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluacionDetalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alerta" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "empleadoId" TEXT,
    "evaluacionId" TEXT,
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

    CONSTRAINT "Alerta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_dni_key" ON "User"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_areaId_idx" ON "User"("areaId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Area_nombre_key" ON "Area"("nombre");

-- CreateIndex
CREATE INDEX "Area_jefeId_idx" ON "Area"("jefeId");

-- CreateIndex
CREATE INDEX "Area_activa_idx" ON "Area"("activa");

-- CreateIndex
CREATE UNIQUE INDEX "KPI_key_key" ON "KPI"("key");

-- CreateIndex
CREATE INDEX "KPI_areaId_idx" ON "KPI"("areaId");

-- CreateIndex
CREATE INDEX "KPI_activo_idx" ON "KPI"("activo");

-- CreateIndex
CREATE INDEX "KPI_puesto_idx" ON "KPI"("puesto");

-- CreateIndex
CREATE INDEX "KPI_tipoCalculo_idx" ON "KPI"("tipoCalculo");

-- CreateIndex
CREATE INDEX "OrdenTrabajo_kpiId_idx" ON "OrdenTrabajo"("kpiId");

-- CreateIndex
CREATE INDEX "OrdenTrabajo_empleadoId_idx" ON "OrdenTrabajo"("empleadoId");

-- CreateIndex
CREATE INDEX "OrdenTrabajo_creadorId_idx" ON "OrdenTrabajo"("creadorId");

-- CreateIndex
CREATE INDEX "OrdenTrabajo_status_idx" ON "OrdenTrabajo"("status");

-- CreateIndex
CREATE INDEX "OrdenTrabajo_fechaLimite_idx" ON "OrdenTrabajo"("fechaLimite");

-- CreateIndex
CREATE INDEX "OrdenTrabajo_tipoOrden_idx" ON "OrdenTrabajo"("tipoOrden");

-- CreateIndex
CREATE INDEX "Tarea_ordenTrabajoId_idx" ON "Tarea"("ordenTrabajoId");

-- CreateIndex
CREATE INDEX "Tarea_completada_idx" ON "Tarea"("completada");

-- CreateIndex
CREATE INDEX "Evidencia_tareaId_idx" ON "Evidencia"("tareaId");

-- CreateIndex
CREATE INDEX "Evidencia_status_idx" ON "Evidencia"("status");

-- CreateIndex
CREATE INDEX "SolicitudTarea_ordenTrabajoId_idx" ON "SolicitudTarea"("ordenTrabajoId");

-- CreateIndex
CREATE INDEX "SolicitudTarea_empleadoId_idx" ON "SolicitudTarea"("empleadoId");

-- CreateIndex
CREATE INDEX "SolicitudTarea_status_idx" ON "SolicitudTarea"("status");

-- CreateIndex
CREATE INDEX "SolicitudEdicion_ordenTrabajoId_idx" ON "SolicitudEdicion"("ordenTrabajoId");

-- CreateIndex
CREATE INDEX "SolicitudEdicion_solicitanteId_idx" ON "SolicitudEdicion"("solicitanteId");

-- CreateIndex
CREATE INDEX "SolicitudEdicion_status_idx" ON "SolicitudEdicion"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RevisionJefe_ordenTrabajoId_key" ON "RevisionJefe"("ordenTrabajoId");

-- CreateIndex
CREATE INDEX "RevisionJefe_ordenTrabajoId_idx" ON "RevisionJefe"("ordenTrabajoId");

-- CreateIndex
CREATE INDEX "RevisionJefe_jefeId_idx" ON "RevisionJefe"("jefeId");

-- CreateIndex
CREATE INDEX "RevisionJefe_status_idx" ON "RevisionJefe"("status");

-- CreateIndex
CREATE INDEX "Evaluacion_empleadoId_idx" ON "Evaluacion"("empleadoId");

-- CreateIndex
CREATE INDEX "Evaluacion_evaluadorId_idx" ON "Evaluacion"("evaluadorId");

-- CreateIndex
CREATE INDEX "Evaluacion_status_idx" ON "Evaluacion"("status");

-- CreateIndex
CREATE INDEX "Evaluacion_anio_idx" ON "Evaluacion"("anio");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluacion_empleadoId_periodo_anio_key" ON "Evaluacion"("empleadoId", "periodo", "anio");

-- CreateIndex
CREATE INDEX "EvaluacionDetalle_evaluacionId_idx" ON "EvaluacionDetalle"("evaluacionId");

-- CreateIndex
CREATE INDEX "EvaluacionDetalle_kpiId_idx" ON "EvaluacionDetalle"("kpiId");

-- CreateIndex
CREATE INDEX "EvaluacionDetalle_ordenTrabajoId_idx" ON "EvaluacionDetalle"("ordenTrabajoId");

-- CreateIndex
CREATE INDEX "EvaluacionDetalle_estado_idx" ON "EvaluacionDetalle"("estado");

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
CREATE INDEX "Alerta_tipo_idx" ON "Alerta"("tipo");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_jefeId_fkey" FOREIGN KEY ("jefeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPI" ADD CONSTRAINT "KPI_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KPI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarea" ADD CONSTRAINT "Tarea_ordenTrabajoId_fkey" FOREIGN KEY ("ordenTrabajoId") REFERENCES "OrdenTrabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidencia" ADD CONSTRAINT "Evidencia_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "Tarea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudTarea" ADD CONSTRAINT "SolicitudTarea_ordenTrabajoId_fkey" FOREIGN KEY ("ordenTrabajoId") REFERENCES "OrdenTrabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudTarea" ADD CONSTRAINT "SolicitudTarea_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudEdicion" ADD CONSTRAINT "SolicitudEdicion_ordenTrabajoId_fkey" FOREIGN KEY ("ordenTrabajoId") REFERENCES "OrdenTrabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudEdicion" ADD CONSTRAINT "SolicitudEdicion_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionJefe" ADD CONSTRAINT "RevisionJefe_ordenTrabajoId_fkey" FOREIGN KEY ("ordenTrabajoId") REFERENCES "OrdenTrabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionJefe" ADD CONSTRAINT "RevisionJefe_jefeId_fkey" FOREIGN KEY ("jefeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_evaluadorId_fkey" FOREIGN KEY ("evaluadorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionDetalle" ADD CONSTRAINT "EvaluacionDetalle_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "Evaluacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionDetalle" ADD CONSTRAINT "EvaluacionDetalle_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KPI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "Evaluacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
