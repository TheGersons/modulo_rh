import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export const CONFIG_KEYS = {
  DIAS_GRACIA_KPI: 'dias_gracia_kpi',
} as const;

const DEFAULTS: Record<string, string> = {
  [CONFIG_KEYS.DIAS_GRACIA_KPI]: '5',
};

const DESCRIPCIONES: Record<string, string> = {
  [CONFIG_KEYS.DIAS_GRACIA_KPI]:
    'Días de gracia tras el cierre de mes para subir respaldos a KPIs basados en órdenes de trabajo y cerrar evaluaciones.',
};

@Injectable()
export class ConfiguracionService implements OnModuleInit {
  private cache = new Map<string, string>();

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    for (const [clave, valor] of Object.entries(DEFAULTS)) {
      await this.prisma.configuracion.upsert({
        where: { clave },
        create: { clave, valor, descripcion: DESCRIPCIONES[clave] },
        update: {},
      });
    }
    await this.refreshCache();
  }

  private async refreshCache() {
    const all = await this.prisma.configuracion.findMany();
    this.cache.clear();
    for (const c of all) this.cache.set(c.clave, c.valor);
  }

  async get(clave: string): Promise<string | null> {
    if (this.cache.has(clave)) return this.cache.get(clave)!;
    const row = await this.prisma.configuracion.findUnique({ where: { clave } });
    if (row) this.cache.set(clave, row.valor);
    return row?.valor ?? DEFAULTS[clave] ?? null;
  }

  async getNumber(clave: string, fallback: number): Promise<number> {
    const v = await this.get(clave);
    if (v === null) return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  async getDiasGracia(): Promise<number> {
    return this.getNumber(CONFIG_KEYS.DIAS_GRACIA_KPI, 5);
  }
}
