-- CreateTable
CREATE TABLE `PlanAccion` (
    `id` VARCHAR(191) NOT NULL,
    `evaluacionId` VARCHAR(191) NOT NULL,
    `empleadoId` VARCHAR(191) NOT NULL,
    `kpiId` VARCHAR(191) NOT NULL,
    `descripcionProblema` TEXT NOT NULL,
    `accionesCorrectivas` TEXT NOT NULL,
    `recursosNecesarios` TEXT NULL,
    `metasEspecificas` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'borrador',
    `motivoRechazo` TEXT NULL,
    `diasPlazo` INTEGER NOT NULL DEFAULT 15,
    `fechaLimite` DATETIME(3) NULL,
    `fechaCompletado` DATETIME(3) NULL,
    `archivosAdjuntos` TEXT NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaEnvio` DATETIME(3) NULL,
    `fechaRevision` DATETIME(3) NULL,
    `fechaAprobacion` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PlanAccion_evaluacionId_idx`(`evaluacionId`),
    INDEX `PlanAccion_empleadoId_idx`(`empleadoId`),
    INDEX `PlanAccion_kpiId_idx`(`kpiId`),
    INDEX `PlanAccion_status_idx`(`status`),
    INDEX `PlanAccion_fechaLimite_idx`(`fechaLimite`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PlanAccion` ADD CONSTRAINT `PlanAccion_evaluacionId_fkey` FOREIGN KEY (`evaluacionId`) REFERENCES `Evaluacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanAccion` ADD CONSTRAINT `PlanAccion_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanAccion` ADD CONSTRAINT `PlanAccion_kpiId_fkey` FOREIGN KEY (`kpiId`) REFERENCES `KPI`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
