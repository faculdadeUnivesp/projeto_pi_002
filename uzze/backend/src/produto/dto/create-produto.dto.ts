import { Type } from 'class-transformer';

import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

import { ProdutoGenero } from '../entities/produto.entity.js';

export class CreateProdutoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nome: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  categoria: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01, { message: 'O valor deve ser maior que zero' })
  valor: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantidade: number;

  @IsEnum(ProdutoGenero)
  genero: ProdutoGenero;

  // Campos opcionais
  @IsOptional()
  @IsString()
  @MaxLength(50)
  material?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  tamanho?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  modelo?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsUUID()
  fornecedor_id?: string;
}
