import { Controller, Get } from '@nestjs/common';
import { User } from '@prisma/client';
import { AppService } from './app.service';
import { PublicRoute } from './guards/jwt.guard';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @PublicRoute()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('user')
  getUser(): Promise<User> {
    return this.prisma.user.findFirst();
  }
}
