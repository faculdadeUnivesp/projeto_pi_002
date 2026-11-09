import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ClienteStatus } from '../entities/cliente.entity.js';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/,
    { message: 'CPF ou CNPJ inválido' },
  )
  cpf_cnpj: string;

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
