import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const PG_POOL = Symbol('PG_POOL');

export type AppDb = ReturnType<typeof drizzle<typeof schema>>;

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly db: AppDb;

  constructor(
    @Inject(PG_POOL) readonly pool: Pool,
    private readonly configService: ConfigService,
  ) {
    this.db = drizzle(this.pool, { schema });
  }

  get periodKey(): string {
    const d = new Date();
    const month = `${d.getUTCMonth() + 1}`.padStart(2, '0');
    return `${d.getUTCFullYear()}-${month}`;
  }

  get corsOrigins(): string[] {
    const raw = this.configService.get<string>('CORS_ORIGINS') ?? '';
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
