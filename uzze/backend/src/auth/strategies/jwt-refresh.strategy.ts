import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsuariosService } from '../../usuarios/usuarios.service.js';
import { UsuarioStatus } from '../../usuarios/entities/usuario.entity.js';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly usuariosService: UsuariosService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET as string,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string; email: string }) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    const usuario = await this.usuariosService.findOneWithRefreshToken(
      payload.sub,
    );
    if (!usuario || usuario.refresh_token !== token) {
      throw new UnauthorizedException('Refresh token inválido');
    }
    if (usuario.status === UsuarioStatus.INATIVO) {
      throw new UnauthorizedException('Conta inativa');
    }
    return { id: usuario.id, email: usuario.email, tipo: usuario.tipo };
  }
}
