/*
  Warnings:

  - You are about to drop the `Area` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Alerta" DROP CONSTRAINT "Alerta_areaId_fkey";

-- DropForeignKey
ALTER TABLE "Area" DROP CONSTRAINT "Area_jefeId_fkey";

-- DropForeignKey
ALTER TABLE "KPI" DROP CONSTRAINT "KPI_areaId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_areaId_fkey";

-- AlterTable
ALTER TABLE "Evaluacion" ADD COLUMN     "areaId" TEXT;

-- AlterTable
ALTER TABLE "OrdenTrabajo" ADD COLUMN     "areaId" TEXT;

-- DropTable
DROP TABLE "Area";

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "jefe_id" TEXT,
    "promedio_global" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_kpis" INTEGER NOT NULL DEFAULT 0,
    "kpis_rojos" INTEGER NOT NULL DEFAULT 0,
    "porcentaje_rojos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nivel_riesgo" TEXT NOT NULL DEFAULT 'BAJO',
    "ranking" INTEGER NOT NULL DEFAULT 0,
    "comentario_rrhh" TEXT,
    "accion_sugerida" TEXT,
    "responsable" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "area_padre_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "areas" ADD CONSTRAINT "areas_area_padre_id_fkey" FOREIGN KEY ("area_padre_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "areas" ADD CONSTRAINT "areas_jefe_id_fkey" FOREIGN KEY ("jefe_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPI" ADD CONSTRAINT "KPI_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
