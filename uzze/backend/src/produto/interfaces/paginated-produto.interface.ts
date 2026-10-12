import { Produto } from '../entities/produto.entity.js';

export interface ProdutoPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedProdutoResponse {
  data: Produto[];

  meta: ProdutoPaginationMeta;
}