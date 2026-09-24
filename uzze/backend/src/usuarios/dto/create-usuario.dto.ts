import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum UsuarioTipo {
  VENDEDOR = 'vendedor',
  ADMIN = 'admin',
}

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  cpf: string;

  @IsString()
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  senha: string;

  @IsEnum(UsuarioTipo)
  @IsOptional()
  tipo?: UsuarioTipo;
}
