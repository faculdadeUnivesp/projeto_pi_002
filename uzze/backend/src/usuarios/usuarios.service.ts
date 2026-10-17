import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario, UsuarioStatus, UsuarioTipo } from './entities/usuario.entity.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { buildMeta, type PaginatedMeta } from '../common/pagination.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  tipo: Usuario['tipo'];
}

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const existingCpf = await this.usuarioRepository.findOne({
      where: { cpf: createUsuarioDto.cpf },
    });
    if (existingCpf) {
      throw new ConflictException('CPF já cadastrado');
    }

    const existingEmail = await this.usuarioRepository.findOne({
      where: { email: createUsuarioDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email já cadastrado');
    }

    const senhaHash = await bcrypt.hash(createUsuarioDto.senha, 10);
    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      senha_hash: senhaHash,
    });

    const saved = await this.usuarioRepository.save(usuario);
    const { senha_hash: _senha_hash, refresh_token: _refresh_token, ...result } = saved;
    return result as Usuario;
  }

  async findAll(
    page = 1,
    limit = 10,
    perfil?: string,
    status?: UsuarioStatus,
  ): Promise<{ data: Usuario[]; meta: PaginatedMeta }> {
    const qb = this.usuarioRepository.createQueryBuilder('usuario');

    if (perfil) {
      qb.andWhere('usuario.tipo = :perfil', { perfil });
    }
    if (status) {
      qb.andWhere('usuario.status = :status', { status });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('usuario.created_at', 'DESC')
      .getManyAndCount();

    const sanitized = data.map(({ senha_hash: _senha_hash, refresh_token: _refresh_token, ...rest }) => rest as Usuario);

    return {
      data: sanitized,
      meta: buildMeta(total, page, limit),
    };
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const { senha_hash: _senha_hash, refresh_token: _refresh_token, ...result } = usuario;
    return result as Usuario;
  }

  async findOneWithRefreshToken(
    id: string,
  ): Promise<(Omit<Usuario, 'refresh_token'> & { refresh_token: string | null }) | null> {
    return this.usuarioRepository.findOne({ where: { id } });
  }

  async findByCpf(cpf: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { cpf } });
  }

  async atualizarPerfil(
    id: string,
    campos: { nome?: string; email?: string; foto?: string | null },
  ): Promise<Omit<Usuario, 'senha_hash' | 'refresh_token'>> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (campos.nome !== undefined) usuario.nome = campos.nome;
    if (campos.email !== undefined) usuario.email = campos.email;
    if (campos.foto !== undefined) {
      (usuario as unknown as { foto: string | null }).foto =
        campos.foto;
    }

    const saved = await this.usuarioRepository.save(usuario);
    const { senha_hash: _senha_hash, refresh_token: _refresh_token, ...rest } =
      saved;
    return rest;
  }

  async alterarSenha(
    id: string,
    novaSenhaHash: string,
  ): Promise<void> {
    await this.usuarioRepository.update(id, {
      senha_hash: novaSenhaHash,
    });
  }

  async verificarSenha(id: string, senhaAtual: string): Promise<boolean> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return bcrypt.compare(senhaAtual, usuario.senha_hash);
  }

  async update(
    id: string,
    updateUsuarioDto: UpdateUsuarioDto,
    currentUser: AuthenticatedUser,
  ): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isSelf = currentUser.id === id;
    const isAdmin = currentUser.tipo === UsuarioTipo.ADMIN;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este usuário',
      );
    }

    if (isSelf) {
      if (updateUsuarioDto.tipo !== undefined) {
        throw new BadRequestException(
          'Você não pode alterar seu próprio perfil',
        );
      }
      if (updateUsuarioDto.status === UsuarioStatus.INATIVO) {
        throw new BadRequestException(
          'Você não pode inativar o seu próprio usuário',
        );
      }
    }

    const allowedForNonAdmin: (keyof UpdateUsuarioDto)[] = [
      'nome',
      'email',
      'foto',
    ];
    const allowedForAdmin: (keyof UpdateUsuarioDto)[] = [
      'nome',
      'email',
      'foto',
      'tipo',
      'status',
    ];
    const allowedFields: (keyof UpdateUsuarioDto)[] = isAdmin
      ? allowedForAdmin
      : allowedForNonAdmin;

    for (const field of allowedFields) {
      const value = updateUsuarioDto[field];
      if (value !== undefined) {
        (usuario as unknown as Record<string, unknown>)[field] = value;
      }
    }

    const saved = await this.usuarioRepository.save(usuario);
    const { senha_hash: _senha_hash, refresh_token: _refresh_token, ...result } = saved;
    return result as Usuario;
  }

  async remove(id: string): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    usuario.status = UsuarioStatus.INATIVO;
    await this.usuarioRepository.save(usuario);
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.usuarioRepository.update(id, { refresh_token: refreshToken });
  }

  async updateUltimoAcesso(id: string): Promise<void> {
    await this.usuarioRepository.update(id, { ultimo_acesso: new Date() });
  }
}
