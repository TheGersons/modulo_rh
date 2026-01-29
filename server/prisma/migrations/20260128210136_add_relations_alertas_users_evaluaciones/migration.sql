-- DropForeignKey
ALTER TABLE `Alerta` DROP FOREIGN KEY `Alerta_areaId_fkey`;

-- CreateIndex
CREATE INDEX `Alerta_empleadoId_idx` ON `Alerta`(`empleadoId`);

-- CreateIndex
CREATE INDEX `Alerta_evaluacionId_idx` ON `Alerta`(`evaluacionId`);

-- AddForeignKey
ALTER TABLE `Alerta` ADD CONSTRAINT `Alerta_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Alerta` ADD CONSTRAINT `Alerta_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Alerta` ADD CONSTRAINT `Alerta_evaluacionId_fkey` FOREIGN KEY (`evaluacionId`) REFERENCES `Evaluacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
