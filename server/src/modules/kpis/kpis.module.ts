import { Module } from '@nestjs/common';
import { KpisService } from "./kpis.service.js";
import { PrismaService } from '../../common/database/prisma.service';
import { KpisController } from './kpis.controller.js';

@Module({
  controllers: [KpisController],
  providers: [KpisService, PrismaService],
  exports: [KpisService],
})
export class KpisModule {}