import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuariosService } from '../../usuarios/usuarios.service.js';
import { UsuarioStatus } from '../../usuarios/entities/usuario.entity.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usuariosService: UsuariosService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const usuario = await this.usuariosService.findOne(payload.sub);
    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    if (usuario.status === UsuarioStatus.INATIVO) {
      throw new UnauthorizedException('Conta inativa');
    }
    return {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      foto: usuario.foto,
      tipo: usuario.tipo,
      status: usuario.status,
    };
  }
}
