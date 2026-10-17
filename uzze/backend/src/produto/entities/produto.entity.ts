import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Fornecedor } from '../../fornecedores/entities/fornecedor.entity.js';

export enum ProdutoGenero {
  FEMININO = 'feminino',
  MASCULINO = 'masculino',
  UNISSEX = 'unissex',
}

export enum ProdutoStatus {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
}

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  nome: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  categoria: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  material: string | null;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  tamanho: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  valor: number;

  @Column({
    type: 'enum',
    enum: ProdutoGenero,
  })
  genero: ProdutoGenero;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  modelo: string | null;

  @Column({
    type: 'int',
    default: 0,
  })
  quantidade: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  imagem: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  descricao: string | null;

  @Column({
    name: 'fornecedor_id',
    type: 'char',
    length: 36,
    nullable: true,
  })
  fornecedor_id: string | null;

  @ManyToOne(() => Fornecedor)
  @JoinColumn({
    name: 'fornecedor_id',
  })
  fornecedor: Fornecedor | null;

  @Column({
    type: 'enum',
    enum: ProdutoStatus,
    default: ProdutoStatus.ATIVO,
  })
  status: ProdutoStatus;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updated_at: Date;
}