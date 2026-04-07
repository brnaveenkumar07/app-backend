import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';
import { resolve } from 'node:path';
import { normalizeDatabaseUrl, resolveDirectUrl } from './src/config/database-url';

loadEnv({ path: resolve(process.cwd(), '.env') });
loadEnv({ path: resolve(process.cwd(), 'apps/api/.env'), override: false });

const rawDatabaseUrl = process.env.DATABASE_URL ?? '';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Prisma CLI should use a direct connection, not the Neon pooler.
    url: rawDatabaseUrl
      ? resolveDirectUrl(process.env.DIRECT_URL, normalizeDatabaseUrl(rawDatabaseUrl))
      : '',
  },
});
