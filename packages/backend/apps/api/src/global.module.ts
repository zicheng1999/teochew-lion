import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '365d',
      },
    }),
    AuthModule,
  ],
  providers: [PrismaService],
  exports: [JwtModule, AuthModule, PrismaService],
})
export class GlobalModule {}
