/*
  Warnings:

  - You are about to drop the column `calificacion` on the `EvaluacionDetalle` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `KPI` table. All the data in the column will be lost.
  - You are about to drop the column `peso` on the `KPI` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `KPI` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `brechaVsMeta` to the `EvaluacionDetalle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `EvaluacionDetalle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `meta` to the `EvaluacionDetalle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resultadoNumerico` to the `EvaluacionDetalle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resultadoPorcentaje` to the `EvaluacionDetalle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sentido` to the `EvaluacionDetalle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tolerancia` to the `EvaluacionDetalle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `umbralAmarillo` to the `EvaluacionDetalle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `area` to the `KPI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `indicador` to the `KPI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `KPI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `meta` to the `KPI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodicidad` to the `KPI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sentido` to the `KPI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tolerancia` to the `KPI` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Area` ADD COLUMN `accionSugerida` TEXT NULL,
    ADD COLUMN `comentarioRRHH` TEXT NULL,
    ADD COLUMN `kpisRojos` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `nivelRiesgo` VARCHAR(191) NULL,
    ADD COLUMN `porcentajeRojos` DOUBLE NULL,
    ADD COLUMN `promedioGlobal` DOUBLE NULL,
    ADD COLUMN `ranking` INTEGER NULL,
    ADD COLUMN `responsable` VARCHAR(191) NULL,
    ADD COLUMN `totalKpis` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Evaluacion` ADD COLUMN `kpisRojos` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `porcentajeRojos` DOUBLE NULL;

-- AlterTable
ALTER TABLE `EvaluacionDetalle` DROP COLUMN `calificacion`,
    ADD COLUMN `brechaVsMeta` DOUBLE NOT NULL,
    ADD COLUMN `estado` VARCHAR(191) NOT NULL,
    ADD COLUMN `meta` DOUBLE NOT NULL,
    ADD COLUMN `resultadoNumerico` DOUBLE NOT NULL,
    ADD COLUMN `resultadoPorcentaje` DOUBLE NOT NULL,
    ADD COLUMN `sentido` VARCHAR(191) NOT NULL,
    ADD COLUMN `tolerancia` DOUBLE NOT NULL,
    ADD COLUMN `umbralAmarillo` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `KPI` DROP COLUMN `nombre`,
    DROP COLUMN `peso`,
    ADD COLUMN `area` VARCHAR(191) NOT NULL,
    ADD COLUMN `formula` TEXT NULL,
    ADD COLUMN `indicador` VARCHAR(191) NOT NULL,
    ADD COLUMN `key` VARCHAR(191) NOT NULL,
    ADD COLUMN `meta` DOUBLE NOT NULL,
    ADD COLUMN `periodicidad` VARCHAR(191) NOT NULL,
    ADD COLUMN `puesto` VARCHAR(191) NULL,
    ADD COLUMN `sentido` VARCHAR(191) NOT NULL,
    ADD COLUMN `tolerancia` DOUBLE NOT NULL,
    ADD COLUMN `umbralAmarillo` DOUBLE NULL,
    ADD COLUMN `unidad` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Alerta` (
    `id` VARCHAR(191) NOT NULL,
    `areaId` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `nivel` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `accionSugerida` TEXT NULL,
    `responsable` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'activa',
    `fechaDeteccion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaResolucion` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Alerta_areaId_idx`(`areaId`),
    INDEX `Alerta_status_idx`(`status`),
    INDEX `Alerta_nivel_idx`(`nivel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TendenciaArea` (
    `id` VARCHAR(191) NOT NULL,
    `areaId` VARCHAR(191) NOT NULL,
    `periodo` VARCHAR(191) NOT NULL,
    `anio` INTEGER NOT NULL,
    `promedioGeneral` DOUBLE NOT NULL,
    `totalKpis` INTEGER NOT NULL,
    `kpisRojos` INTEGER NOT NULL,
    `porcentajeRojos` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TendenciaArea_areaId_idx`(`areaId`),
    INDEX `TendenciaArea_periodo_anio_idx`(`periodo`, `anio`),
    UNIQUE INDEX `TendenciaArea_areaId_periodo_anio_key`(`areaId`, `periodo`, `anio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogImportacion` (
    `id` VARCHAR(191) NOT NULL,
    `fechaHora` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `archivo` VARCHAR(191) NOT NULL,
    `registrosImportados` INTEGER NOT NULL,
    `registrosOmitidos` INTEGER NOT NULL,
    `comentariosImportados` INTEGER NOT NULL,
    `estado` VARCHAR(191) NOT NULL,
    `observaciones` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LogImportacion_fechaHora_idx`(`fechaHora`),
    INDEX `LogImportacion_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `EvaluacionDetalle_estado_idx` ON `EvaluacionDetalle`(`estado`);

-- CreateIndex
CREATE UNIQUE INDEX `KPI_key_key` ON `KPI`(`key`);

-- CreateIndex
CREATE INDEX `KPI_key_idx` ON `KPI`(`key`);

-- AddForeignKey
ALTER TABLE `Alerta` ADD CONSTRAINT `Alerta_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
