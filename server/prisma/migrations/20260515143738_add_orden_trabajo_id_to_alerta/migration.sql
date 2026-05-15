-- AlterTable
ALTER TABLE "Alerta" ADD COLUMN     "ordenTrabajoId" TEXT;

-- CreateIndex
CREATE INDEX "Alerta_ordenTrabajoId_idx" ON "Alerta"("ordenTrabajoId");

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_ordenTrabajoId_fkey" FOREIGN KEY ("ordenTrabajoId") REFERENCES "OrdenTrabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
