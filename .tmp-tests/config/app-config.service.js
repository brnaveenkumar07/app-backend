"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AppConfigService = class AppConfigService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    get databaseUrl() {
        return this.getOrThrow('DATABASE_URL');
    }
    get port() {
        return Number(this.configService.get('PORT', '3000'));
    }
    get host() {
        return this.configService.get('HOST', '0.0.0.0');
    }
    get jwtAccessSecret() {
        return this.getOrThrow('JWT_ACCESS_SECRET');
    }
    get jwtRefreshSecret() {
        return this.getOrThrow('JWT_REFRESH_SECRET');
    }
    get jwtAccessTtl() {
        return this.configService.get('JWT_ACCESS_TTL', '15m');
    }
    get jwtRefreshTtl() {
        return this.configService.get('JWT_REFRESH_TTL', '7d');
    }
    get attendanceWarningThreshold() {
        return Number(this.configService.get('ATTENDANCE_WARNING_THRESHOLD', '75'));
    }
    get apiPrefix() {
        return this.configService.get('API_PREFIX', 'api');
    }
    get corsOrigins() {
        return this.configService
            .get('CORS_ORIGIN', '')
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean);
    }
    getOrThrow(key) {
        const value = this.configService.get(key);
        if (!value) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
        return value;
    }
};
exports.AppConfigService = AppConfigService;
exports.AppConfigService = AppConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppConfigService);
