import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuariosService.findByCpf(loginDto.cpf);
    if (!usuario) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    if (usuario.status !== 'ativo') {
      throw new UnauthorizedException('Conta inativa');
    }

    const senhaValida = await bcrypt.compare(
      loginDto.senha,
      usuario.senha_hash,
    );
    if (!senhaValida) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    const tokens = await this.generateTokens(usuario.id, usuario.email);
    await this.usuariosService.updateRefreshToken(
      usuario.id,
      tokens.refreshToken,
    );
    await this.usuariosService.updateUltimoAcesso(usuario.id);

    const { senha_hash, refresh_token, ...usuarioData } = usuario;
    return {
      ...tokens,
      usuario: usuarioData,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const usuario = await this.usuariosService.findOne(userId);
    if (!usuario || !usuario.refresh_token) {
      throw new UnauthorizedException('Acesso negado');
    }

    const rtMatches = refreshToken === usuario.refresh_token;
    if (!rtMatches) {
      throw new UnauthorizedException('Acesso negado');
    }

    const tokens = await this.generateTokens(usuario.id, usuario.email);
    await this.usuariosService.updateRefreshToken(
      usuario.id,
      tokens.refreshToken,
    );
    return tokens;
  }

  async logout(userId: string) {
    await this.usuariosService.updateRefreshToken(userId, null);
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: (process.env.JWT_EXPIRATION || '3600') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '604800') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
