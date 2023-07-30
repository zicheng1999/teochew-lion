import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IUser } from '~libs/entities';
import { PrismaService } from '~api/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(accessToken: string): Promise<IUser> {
    const user = await this.prisma.user.findFirst({
      where: { token: accessToken },
    });
    if (!user) throw new UnauthorizedException();
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
