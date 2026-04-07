import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get databaseUrl() {
    return this.getOrThrow('DATABASE_URL');
  }

  get port() {
    return Number(this.configService.get<string>('PORT', '3000'));
  }

  get host() {
    return this.configService.get<string>('HOST', '0.0.0.0');
  }

  get jwtAccessSecret() {
    return this.getOrThrow('JWT_ACCESS_SECRET');
  }

  get jwtRefreshSecret() {
    return this.getOrThrow('JWT_REFRESH_SECRET');
  }

  get jwtAccessTtl() {
    return this.configService.get<string>('JWT_ACCESS_TTL', '15m');
  }

  get jwtRefreshTtl() {
    return this.configService.get<string>('JWT_REFRESH_TTL', '7d');
  }

  get attendanceWarningThreshold() {
    return Number(this.configService.get<string>('ATTENDANCE_WARNING_THRESHOLD', '75'));
  }

  get apiPrefix() {
    return this.configService.get<string>('API_PREFIX', 'api');
  }

  get corsOrigins() {
    return this.configService
      .get<string>('CORS_ORIGIN', '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  private getOrThrow(key: string) {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }

    return value;
  }
}
