import { Injectable } from '@nestjs/common';
import { PrismaService } from './common/database/prisma.service';

@Injectable()
export class AppService {
  constructor(private prismaService: PrismaService) {}

}
