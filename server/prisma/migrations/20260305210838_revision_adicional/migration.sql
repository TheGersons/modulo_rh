-- CreateTable
CREATE TABLE "revisores_asignados" (
    "id" TEXT NOT NULL,
    "empleado_id" TEXT NOT NULL,
    "revisor_id" TEXT NOT NULL,
    "motivo" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revisores_asignados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "revisores_asignados_empleado_id_idx" ON "revisores_asignados"("empleado_id");

-- CreateIndex
CREATE INDEX "revisores_asignados_revisor_id_idx" ON "revisores_asignados"("revisor_id");

-- CreateIndex
CREATE UNIQUE INDEX "revisores_asignados_empleado_id_activo_key" ON "revisores_asignados"("empleado_id", "activo");

-- AddForeignKey
ALTER TABLE "revisores_asignados" ADD CONSTRAINT "revisores_asignados_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisores_asignados" ADD CONSTRAINT "revisores_asignados_revisor_id_fkey" FOREIGN KEY ("revisor_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
