import { Type } from 'class-transformer';

import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

import {
  ProdutoGenero,
  ProdutoStatus,
} from '../entities/produto.entity.js';

export class ListProdutoQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsString()
  busca?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsString()
  tamanho?: string;

  @IsOptional()
  @IsEnum(ProdutoGenero)
  genero?: ProdutoGenero;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsUUID()
  fornecedor_id?: string;

  @IsOptional()
  @IsEnum(ProdutoStatus)
  status?: ProdutoStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valor_min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  valor_max?: number;
}