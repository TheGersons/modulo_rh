-- CreateTable
CREATE TABLE "evidencias_kpi" (
    "id" TEXT NOT NULL,
    "kpi_id" TEXT NOT NULL,
    "empleado_id" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "archivo_url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tamanio" INTEGER,
    "valor_numerico" DOUBLE PRECISION,
    "nota" TEXT,
    "intento" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'pendiente_revision',
    "motivo_rechazo" TEXT,
    "apelacion" TEXT,
    "respuesta_apelacion" TEXT,
    "fecha_apelacion" TIMESTAMP(3),
    "es_fuera_de_tiempo" BOOLEAN NOT NULL DEFAULT false,
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisado_por" TEXT,
    "fecha_revision" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "evidencias_kpi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evidencias_kpi_kpi_id_idx" ON "evidencias_kpi"("kpi_id");

-- CreateIndex
CREATE INDEX "evidencias_kpi_empleado_id_idx" ON "evidencias_kpi"("empleado_id");

-- CreateIndex
CREATE INDEX "evidencias_kpi_periodo_idx" ON "evidencias_kpi"("periodo");

-- CreateIndex
CREATE INDEX "evidencias_kpi_status_idx" ON "evidencias_kpi"("status");

-- AddForeignKey
ALTER TABLE "evidencias_kpi" ADD CONSTRAINT "evidencias_kpi_kpi_id_fkey" FOREIGN KEY ("kpi_id") REFERENCES "KPI"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias_kpi" ADD CONSTRAINT "evidencias_kpi_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias_kpi" ADD CONSTRAINT "evidencias_kpi_revisado_por_fkey" FOREIGN KEY ("revisado_por") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias_kpi" ADD CONSTRAINT "evidencias_kpi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
