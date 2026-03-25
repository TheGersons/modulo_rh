import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { PrismaService } from 'src/common/database/prisma.service';
import { StorageController } from './storage.controller';
import { AlertasModule } from '../alertas/alertas.module';

@Module({
  imports: [AlertasModule],
  controllers: [StorageController],
  providers: [StorageService, PrismaService],
  exports: [StorageService],
})
export class StorageModule {}
