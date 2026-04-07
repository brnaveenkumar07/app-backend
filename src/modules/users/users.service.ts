import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        adminProfile: true,
        teacherProfile: true,
        studentProfile: {
          include: {
            section: {
              include: {
                academicClass: true,
              },
            },
          },
        },
      },
    });
  }
}
