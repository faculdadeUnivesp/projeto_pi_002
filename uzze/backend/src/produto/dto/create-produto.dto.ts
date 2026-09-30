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

import { ProdutoGenero, } from '../entities/produto.entity.js';

export class CreateProdutoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nome: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  categoria: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  material: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  tamanho: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valor: number;

  @IsEnum(ProdutoGenero)
  genero: ProdutoGenero;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  modelo: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantidade: number;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsUUID()
  fornecedor_id: string;
}