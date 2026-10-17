import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { UsuarioStatus, UsuarioTipo } from '../entities/usuario.entity.js';

export class UpdateUsuarioDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  nome?: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  foto?: string;

  @IsEnum(UsuarioTipo)
  @IsOptional()
  tipo?: UsuarioTipo;

  @IsEnum(UsuarioStatus)
  @IsOptional()
  status?: UsuarioStatus;
}
