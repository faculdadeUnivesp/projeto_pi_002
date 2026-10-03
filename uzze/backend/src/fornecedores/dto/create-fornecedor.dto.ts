import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

import { FornecedorStatus } from '../entities/fornecedor.entity.js';

export class CreateFornecedorDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
    message: 'CNPJ inválido',
  })
  cnpj: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  contato: string;

  @IsOptional()
  @IsEnum(FornecedorStatus)
  status?: FornecedorStatus;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}-\d{3}$/, {
    message: 'CEP inválido',
  })
  cep: string;

  @IsString()
  @IsNotEmpty()
  rua: string;

  @IsString()
  @IsNotEmpty()
  numero: string;

  @IsString()
  @IsNotEmpty()
  bairro: string;

  @IsString()
  @IsNotEmpty()
  cidade: string;

  @IsString()
  @Length(2, 2)
  estado: string;

  @IsString()
  @IsNotEmpty()
  pais: string;

  @IsOptional()
  @IsString()
  complemento?: string;
}