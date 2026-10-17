import { Type } from 'class-transformer';

import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

import { ProdutoGenero, ProdutoStatus } from '../entities/produto.entity.js';

export class UpdateProdutoDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  categoria?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01, { message: 'O valor deve ser maior que zero' })
  valor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantidade?: number;

  @IsOptional()
  @IsEnum(ProdutoGenero)
  genero?: ProdutoGenero;

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

  @IsOptional()
  @IsEnum(ProdutoStatus)
  status?: ProdutoStatus;
}
