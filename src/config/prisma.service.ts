import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { normalizeDatabaseUrl } from './database-url';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(configService: ConfigService) {
    const rawDatabaseUrl = configService.get<string>('DATABASE_URL');

    if (!rawDatabaseUrl) {
      throw new Error('Missing required environment variable: DATABASE_URL');
    }

    super({
      datasources: {
        db: {
          url: normalizeDatabaseUrl(rawDatabaseUrl),
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Prisma connection error';

      throw new Error(
        [
          'Database connection failed during startup.',
          message,
          'Check apps/api/.env and make sure DATABASE_URL uses the Neon pooler host with sslmode=require&pgbouncer=true.',
          'Use a non-pooler Neon host for DIRECT_URL when running Prisma migrations or seed commands.',
        ].join(' '),
      );
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
