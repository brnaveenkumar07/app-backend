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
exports.SchoolsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let SchoolsService = class SchoolsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list() {
        return this.prisma.school.findMany({
            include: {
                classes: {
                    include: {
                        sections: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    create(payload) {
        return this.prisma.school.create({
            data: {
                name: payload.name.trim(),
                code: payload.code.trim().toUpperCase(),
                address: payload.address?.trim(),
                city: payload.city?.trim(),
                state: payload.state?.trim(),
                country: payload.country?.trim(),
                timezone: payload.timezone?.trim() ?? 'Asia/Kolkata',
            },
        });
    }
    update(schoolId, payload) {
        return this.prisma.school.update({
            where: { id: schoolId },
            data: {
                name: payload.name?.trim(),
                code: payload.code?.trim().toUpperCase(),
                address: payload.address?.trim(),
                city: payload.city?.trim(),
                state: payload.state?.trim(),
                country: payload.country?.trim(),
                timezone: payload.timezone?.trim(),
            },
        });
    }
    async remove(schoolId) {
        await this.prisma.school.delete({ where: { id: schoolId } });
        return { message: 'School deleted successfully' };
    }
};
exports.SchoolsService = SchoolsService;
exports.SchoolsService = SchoolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchoolsService);
