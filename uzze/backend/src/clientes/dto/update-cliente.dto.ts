import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ClienteStatus } from '../entities/cliente.entity.js';

export class UpdateClienteDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nome?: string;

  @IsOptional()
  @IsString()
  @Matches(
    /^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/,
    { message: 'CPF ou CNPJ inválido' },
  )
  cpf_cnpj?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsEnum(ClienteStatus)
  status?: ClienteStatus;
}
