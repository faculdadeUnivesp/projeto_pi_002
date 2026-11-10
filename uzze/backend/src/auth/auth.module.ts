import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { parseExpiresIn } from './jwt-expiration.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy.js';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production');
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is required in production');
  }
} else {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      'JWT_SECRET não definido. Copie .env.example para .env e configure os segredos.',
    );
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error(
      'JWT_REFRESH_SECRET não definido. Copie .env.example para .env e configure os segredos.',
    );
  }
}

@Module({
  imports: [
    UsuariosModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: parseExpiresIn(process.env.JWT_EXPIRATION, 3600),
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
