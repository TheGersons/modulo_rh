-- AlterTable
ALTER TABLE "KPI" ADD COLUMN     "operadorMeta" TEXT DEFAULT '=',
ADD COLUMN     "tipoCriticidad" TEXT NOT NULL DEFAULT 'no_critico';

-- AlterTable
ALTER TABLE "OrdenTrabajo" ADD COLUMN     "valoresCalculo" TEXT;

-- CreateIndex
CREATE INDEX "KPI_tipoCriticidad_idx" ON "KPI"("tipoCriticidad");
