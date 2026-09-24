import { IsString, IsOptional, IsEnum } from 'class-validator';
import { UsuarioTipo, UsuarioStatus } from '../entities/usuario.entity.js';

export class UpdateUsuarioDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  foto?: string;

  @IsEnum(UsuarioTipo)
  @IsOptional()
  tipo?: UsuarioTipo;

  @IsEnum(UsuarioStatus)
  @IsOptional()
  status?: UsuarioStatus;
}
