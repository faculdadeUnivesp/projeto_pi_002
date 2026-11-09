import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FormaPagamento } from '../entities/venda.entity.js';

export class ItemVendaDto {
  @IsUUID()
  @IsNotEmpty()
  produtoId: string;

  @IsInt()
  @Min(1)
  quantidade: number;
}

export class CreateVendaDto {
  @IsEnum(FormaPagamento)
  @IsNotEmpty()
  formaPagamento: FormaPagamento;

  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @ValidateNested({ each: true })
  @Type(() => ItemVendaDto)
  @ArrayMinSize(1)
  itens: ItemVendaDto[];
}