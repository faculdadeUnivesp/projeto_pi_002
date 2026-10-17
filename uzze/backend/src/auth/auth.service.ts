import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { SignOptions } from 'jsonwebtoken';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { LoginDto } from './dto/login.dto.js';
import { AlterarSenhaDto, UpdateMeDto } from './dto/me.dto.js';

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

    const { senha_hash: _senha_hash, refresh_token: _refresh_token, ...usuarioData } = usuario;
    return {
      ...tokens,
      usuario: usuarioData,
    };
  }

  async refreshTokens(userId: string) {
    const usuario = await this.usuariosService.findOneWithRefreshToken(userId);
    if (!usuario || !usuario.refresh_token) {
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

  async updateMe(userId: string, dto: UpdateMeDto) {
    return this.usuariosService.atualizarPerfil(userId, {
      nome: dto.nome,
      email: dto.email,
      foto: dto.foto === undefined ? undefined : dto.foto || null,
    });
  }

  async alterarSenha(userId: string, dto: AlterarSenhaDto) {
    if (dto.senhaAtual) {
      const ok = await this.usuariosService.verificarSenha(
        userId,
        dto.senhaAtual,
      );
      if (!ok) {
        throw new UnauthorizedException('Senha atual incorreta');
      }
    }

    const novaHash = await bcrypt.hash(dto.novaSenha, 10);
    await this.usuariosService.alterarSenha(userId, novaHash);
    await this.usuariosService.updateRefreshToken(userId, null);

    return { message: 'Senha alterada com sucesso' };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessExpiresIn = (process.env.JWT_EXPIRATION ||
      '3600') as SignOptions['expiresIn'];
    const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRATION ||
      '604800') as SignOptions['expiresIn'];

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
