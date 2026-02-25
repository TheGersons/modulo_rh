/*
  Warnings:

  - You are about to drop the column `comentarioGeneral` on the `Evaluacion` table. All the data in the column will be lost.
  - You are about to drop the column `fechaEnvio` on the `Evaluacion` table. All the data in the column will be lost.
  - You are about to drop the column `fechaValidacion` on the `Evaluacion` table. All the data in the column will be lost.
  - You are about to drop the column `comentarios` on the `EvaluacionDetalle` table. All the data in the column will be lost.
  - You are about to drop the column `sentido` on the `EvaluacionDetalle` table. All the data in the column will be lost.
  - You are about to drop the column `tolerancia` on the `EvaluacionDetalle` table. All the data in the column will be lost.
  - You are about to drop the column `formula` on the `KPI` table. All the data in the column will be lost.
  - You are about to drop the `Configuracion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LogImportacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notificacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlanAccion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TendenciaArea` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Validacion` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[empleadoId,periodo,anio]` on the table `Evaluacion` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nivelRiesgo` on table `Area` required. This step will fail if there are existing NULL values in that column.
  - Made the column `porcentajeRojos` on table `Area` required. This step will fail if there are existing NULL values in that column.
  - Made the column `promedioGlobal` on table `Area` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ranking` on table `Area` required. This step will fail if there are existing NULL values in that column.
  - Made the column `porcentajeRojos` on table `Evaluacion` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `formulaCalculo` to the `KPI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoCalculo` to the `KPI` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Area" DROP CONSTRAINT "Area_jefeId_fkey";

-- DropForeignKey
ALTER TABLE "KPI" DROP CONSTRAINT "KPI_areaId_fkey";

-- DropForeignKey
ALTER TABLE "PlanAccion" DROP CONSTRAINT "PlanAccion_empleadoId_fkey";

-- DropForeignKey
ALTER TABLE "PlanAccion" DROP CONSTRAINT "PlanAccion_evaluacionId_fkey";

-- DropForeignKey
ALTER TABLE "PlanAccion" DROP CONSTRAINT "PlanAccion_kpiId_fkey";

-- DropForeignKey
ALTER TABLE "Validacion" DROP CONSTRAINT "Validacion_empleadoId_fkey";

-- DropForeignKey
ALTER TABLE "Validacion" DROP CONSTRAINT "Validacion_evaluacionId_fkey";

-- DropIndex
DROP INDEX "Area_jefeId_key";

-- DropIndex
DROP INDEX "Evaluacion_periodo_anio_idx";

-- DropIndex
DROP INDEX "EvaluacionDetalle_evaluacionId_kpiId_key";

-- DropIndex
DROP INDEX "KPI_key_idx";

-- AlterTable
ALTER TABLE "Area" ALTER COLUMN "jefeId" DROP NOT NULL,
ALTER COLUMN "nivelRiesgo" SET NOT NULL,
ALTER COLUMN "nivelRiesgo" SET DEFAULT 'BAJO',
ALTER COLUMN "porcentajeRojos" SET NOT NULL,
ALTER COLUMN "porcentajeRojos" SET DEFAULT 0,
ALTER COLUMN "promedioGlobal" SET NOT NULL,
ALTER COLUMN "promedioGlobal" SET DEFAULT 0,
ALTER COLUMN "ranking" SET NOT NULL,
ALTER COLUMN "ranking" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Evaluacion" DROP COLUMN "comentarioGeneral",
DROP COLUMN "fechaEnvio",
DROP COLUMN "fechaValidacion",
ADD COLUMN     "calculadaAutomaticamente" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fechaCalculo" TIMESTAMP(3),
ADD COLUMN     "fechaCierre" TIMESTAMP(3),
ALTER COLUMN "tipoPeriodo" DROP NOT NULL,
ALTER COLUMN "porcentajeRojos" SET NOT NULL,
ALTER COLUMN "porcentajeRojos" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "EvaluacionDetalle" DROP COLUMN "comentarios",
DROP COLUMN "sentido",
DROP COLUMN "tolerancia",
ADD COLUMN     "formulaUtilizada" TEXT,
ADD COLUMN     "ordenTrabajoId" TEXT,
ALTER COLUMN "brechaVsMeta" DROP NOT NULL,
ALTER COLUMN "estado" DROP NOT NULL,
ALTER COLUMN "meta" DROP NOT NULL,
ALTER COLUMN "resultadoPorcentaje" DROP NOT NULL,
ALTER COLUMN "umbralAmarillo" DROP NOT NULL;

-- AlterTable
ALTER TABLE "KPI" DROP COLUMN "formula",
ADD COLUMN     "formulaCalculo" TEXT NOT NULL,
ADD COLUMN     "tipoCalculo" TEXT NOT NULL,
ALTER COLUMN "meta" DROP NOT NULL,
ALTER COLUMN "tolerancia" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "dni" DROP NOT NULL;

-- DropTable
DROP TABLE "Configuracion";

-- DropTable
DROP TABLE "LogImportacion";

-- DropTable
DROP TABLE "Notificacion";

-- DropTable
DROP TABLE "PlanAccion";

-- DropTable
DROP TABLE "TendenciaArea";

-- DropTable
DROP TABLE "Validacion";

-- CreateTable
CREATE TABLE "OrdenTrabajo" (
    "id" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "creadorId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidadTareas" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLimite" TIMESTAMP(3) NOT NULL,
    "fechaCompletada" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pendiente',
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
    "fechaCompletada" TIMESTAMP(3),
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
    "status" TEXT NOT NULL DEFAULT 'pendiente_revision',
    "motivoRechazo" TEXT,
    "fechaSubida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evidencia_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "Tarea_ordenTrabajoId_idx" ON "Tarea"("ordenTrabajoId");

-- CreateIndex
CREATE INDEX "Tarea_completada_idx" ON "Tarea"("completada");

-- CreateIndex
CREATE INDEX "Evidencia_tareaId_idx" ON "Evidencia"("tareaId");

-- CreateIndex
CREATE INDEX "Evidencia_status_idx" ON "Evidencia"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RevisionJefe_ordenTrabajoId_key" ON "RevisionJefe"("ordenTrabajoId");

-- CreateIndex
CREATE INDEX "RevisionJefe_ordenTrabajoId_idx" ON "RevisionJefe"("ordenTrabajoId");

-- CreateIndex
CREATE INDEX "RevisionJefe_jefeId_idx" ON "RevisionJefe"("jefeId");

-- CreateIndex
CREATE INDEX "RevisionJefe_status_idx" ON "RevisionJefe"("status");

-- CreateIndex
CREATE INDEX "Alerta_tipo_idx" ON "Alerta"("tipo");

-- CreateIndex
CREATE INDEX "Area_activa_idx" ON "Area"("activa");

-- CreateIndex
CREATE INDEX "Evaluacion_anio_idx" ON "Evaluacion"("anio");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluacion_empleadoId_periodo_anio_key" ON "Evaluacion"("empleadoId", "periodo", "anio");

-- CreateIndex
CREATE INDEX "EvaluacionDetalle_ordenTrabajoId_idx" ON "EvaluacionDetalle"("ordenTrabajoId");

-- CreateIndex
CREATE INDEX "KPI_puesto_idx" ON "KPI"("puesto");

-- CreateIndex
CREATE INDEX "KPI_tipoCalculo_idx" ON "KPI"("tipoCalculo");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

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
ALTER TABLE "RevisionJefe" ADD CONSTRAINT "RevisionJefe_ordenTrabajoId_fkey" FOREIGN KEY ("ordenTrabajoId") REFERENCES "OrdenTrabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionJefe" ADD CONSTRAINT "RevisionJefe_jefeId_fkey" FOREIGN KEY ("jefeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
