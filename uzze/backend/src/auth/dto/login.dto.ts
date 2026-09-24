import { IsString, IsNotEmpty, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  cpf: string;

  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @Length(6, 20, { message: 'Senha deve ter entre 6 e 20 caracteres' })
  senha: string;
}
