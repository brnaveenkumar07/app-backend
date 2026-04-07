import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolsService {
  constructor(private readonly prisma: PrismaService) {}

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

  create(payload: CreateSchoolDto) {
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

  update(schoolId: string, payload: UpdateSchoolDto) {
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

  async remove(schoolId: string) {
    await this.prisma.school.delete({ where: { id: schoolId } });

    return { message: 'School deleted successfully' };
  }
}
