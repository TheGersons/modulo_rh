/*
  Warnings:

  - You are about to drop the column `puesto` on the `KPI` table. All the data in the column will be lost.
  - You are about to drop the column `puesto` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "KPI_puesto_idx";

-- AlterTable
ALTER TABLE "KPI" DROP COLUMN "puesto",
ADD COLUMN     "puesto_id" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "puesto",
ADD COLUMN     "puesto_id" TEXT;

-- CreateTable
CREATE TABLE "puestos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "area_id" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puestos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "puestos_nombre_area_id_key" ON "puestos"("nombre", "area_id");

-- CreateIndex
CREATE INDEX "KPI_puesto_id_idx" ON "KPI"("puesto_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_puesto_id_fkey" FOREIGN KEY ("puesto_id") REFERENCES "puestos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPI" ADD CONSTRAINT "KPI_puesto_id_fkey" FOREIGN KEY ("puesto_id") REFERENCES "puestos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puestos" ADD CONSTRAINT "puestos_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
