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
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const database_url_1 = require("./database-url");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor(configService) {
        const rawDatabaseUrl = configService.get('DATABASE_URL');
        if (!rawDatabaseUrl) {
            throw new Error('Missing required environment variable: DATABASE_URL');
        }
        super({
            datasources: {
                db: {
                    url: (0, database_url_1.normalizeDatabaseUrl)(rawDatabaseUrl),
                },
            },
        });
    }
    async onModuleInit() {
        try {
            await this.$connect();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown Prisma connection error';
            throw new Error([
                'Database connection failed during startup.',
                message,
                'Check apps/api/.env and make sure DATABASE_URL uses the Neon pooler host with sslmode=require&pgbouncer=true.',
                'Use a non-pooler Neon host for DIRECT_URL when running Prisma migrations or seed commands.',
            ].join(' '));
        }
    }
    async enableShutdownHooks(app) {
        process.on('beforeExit', async () => {
            await app.close();
        });
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PrismaService);
