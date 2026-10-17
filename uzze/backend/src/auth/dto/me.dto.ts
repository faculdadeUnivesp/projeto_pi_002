import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateMeDto {
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
  @IsUrl({}, { message: 'Foto deve ser uma URL válida' })
  foto?: string;
}

export class AlterarSenhaDto {
  @IsString()
  @IsOptional()
  @MinLength(6, {
    message: 'Senha atual deve ter no mínimo 6 caracteres',
  })
  senhaAtual?: string;

  @IsString()
  @MinLength(6, { message: 'Nova senha deve ter no mínimo 6 caracteres' })
  novaSenha: string;
}
