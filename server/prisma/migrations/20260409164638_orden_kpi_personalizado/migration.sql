-- DropForeignKey
ALTER TABLE "OrdenTrabajo" DROP CONSTRAINT "OrdenTrabajo_kpiId_fkey";

-- AlterTable
ALTER TABLE "OrdenTrabajo" ALTER COLUMN "kpiId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KPI"("id") ON DELETE SET NULL ON UPDATE CASCADE;
