import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario, UsuarioStatus } from './entities/usuario.entity.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';

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
    const { senha_hash, refresh_token, ...result } = saved;
    return result as Usuario;
  }

  async findAll(
    page = 1,
    limit = 10,
    perfil?: string,
    status?: UsuarioStatus,
  ): Promise<{ data: Usuario[]; meta: { total: number; page: number; limit: number } }> {
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

    const sanitized = data.map(({ senha_hash, refresh_token, ...rest }) => rest as Usuario);

    return {
      data: sanitized,
      meta: { total, page, limit },
    };
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const { senha_hash, refresh_token, ...result } = usuario;
    return result as Usuario;
  }

  async findByCpf(cpf: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { cpf } });
  }

  async update(
    id: string,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    Object.assign(usuario, updateUsuarioDto);
    const saved = await this.usuarioRepository.save(usuario);
    const { senha_hash, refresh_token, ...result } = saved;
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
