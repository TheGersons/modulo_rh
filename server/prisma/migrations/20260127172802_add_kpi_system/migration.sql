-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'empleado',
    `areaId` VARCHAR(191) NULL,
    `puesto` VARCHAR(191) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_areaId_idx`(`areaId`),
    INDEX `User_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Area` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `jefeId` VARCHAR(191) NOT NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Area_nombre_key`(`nombre`),
    UNIQUE INDEX `Area_jefeId_key`(`jefeId`),
    INDEX `Area_jefeId_idx`(`jefeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KPI` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `areaId` VARCHAR(191) NOT NULL,
    `peso` INTEGER NOT NULL DEFAULT 100,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `KPI_areaId_idx`(`areaId`),
    INDEX `KPI_activo_idx`(`activo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Evaluacion` (
    `id` VARCHAR(191) NOT NULL,
    `empleadoId` VARCHAR(191) NOT NULL,
    `evaluadorId` VARCHAR(191) NOT NULL,
    `periodo` VARCHAR(191) NOT NULL,
    `tipoPeriodo` VARCHAR(191) NOT NULL,
    `anio` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'borrador',
    `promedioGeneral` DOUBLE NULL,
    `comentarioGeneral` TEXT NULL,
    `fechaEnvio` DATETIME(3) NULL,
    `fechaValidacion` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Evaluacion_empleadoId_idx`(`empleadoId`),
    INDEX `Evaluacion_evaluadorId_idx`(`evaluadorId`),
    INDEX `Evaluacion_periodo_anio_idx`(`periodo`, `anio`),
    INDEX `Evaluacion_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvaluacionDetalle` (
    `id` VARCHAR(191) NOT NULL,
    `evaluacionId` VARCHAR(191) NOT NULL,
    `kpiId` VARCHAR(191) NOT NULL,
    `calificacion` DOUBLE NOT NULL,
    `comentarios` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EvaluacionDetalle_evaluacionId_idx`(`evaluacionId`),
    INDEX `EvaluacionDetalle_kpiId_idx`(`kpiId`),
    UNIQUE INDEX `EvaluacionDetalle_evaluacionId_kpiId_key`(`evaluacionId`, `kpiId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Validacion` (
    `id` VARCHAR(191) NOT NULL,
    `evaluacionId` VARCHAR(191) NOT NULL,
    `empleadoId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `motivoRevision` TEXT NULL,
    `respuestaJefe` TEXT NULL,
    `fechaValidacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Validacion_evaluacionId_key`(`evaluacionId`),
    INDEX `Validacion_evaluacionId_idx`(`evaluacionId`),
    INDEX `Validacion_empleadoId_idx`(`empleadoId`),
    INDEX `Validacion_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notificacion` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `mensaje` TEXT NOT NULL,
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `url` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notificacion_userId_idx`(`userId`),
    INDEX `Notificacion_leida_idx`(`leida`),
    INDEX `Notificacion_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Configuracion` (
    `id` VARCHAR(191) NOT NULL,
    `clave` VARCHAR(191) NOT NULL,
    `valor` TEXT NOT NULL,

    UNIQUE INDEX `Configuracion_clave_key`(`clave`),
    INDEX `Configuracion_clave_idx`(`clave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Area` ADD CONSTRAINT `Area_jefeId_fkey` FOREIGN KEY (`jefeId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KPI` ADD CONSTRAINT `KPI_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluacion` ADD CONSTRAINT `Evaluacion_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluacion` ADD CONSTRAINT `Evaluacion_evaluadorId_fkey` FOREIGN KEY (`evaluadorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluacionDetalle` ADD CONSTRAINT `EvaluacionDetalle_evaluacionId_fkey` FOREIGN KEY (`evaluacionId`) REFERENCES `Evaluacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluacionDetalle` ADD CONSTRAINT `EvaluacionDetalle_kpiId_fkey` FOREIGN KEY (`kpiId`) REFERENCES `KPI`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Validacion` ADD CONSTRAINT `Validacion_evaluacionId_fkey` FOREIGN KEY (`evaluacionId`) REFERENCES `Evaluacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Validacion` ADD CONSTRAINT `Validacion_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
