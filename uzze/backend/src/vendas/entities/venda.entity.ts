import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';
import { ItemVenda } from './item-venda.entity.js';


export enum FormaPagamento {
  DINHEIRO = 'dinheiro',
  CARTAO = 'cartao',
  PIX = 'pix',
}

export enum VendaStatus {
  CONCLUIDA = 'concluida',
  CANCELADA = 'cancelada',
}

@Entity('vendas')
export class Venda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  numero_venda: string;

  @Column({
    type: 'timestamp',
  })
  data: Date;

  @Column({
    type: 'enum',
    enum: FormaPagamento,
  })
  forma_pagamento: FormaPagamento;

  @Column({
    type: 'uuid',
  })
  vendedor_id: string;

  @ManyToOne(() => Usuario, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'vendedor_id' })
  vendedor: Usuario;

  @Column({
    name: 'cliente_id',
    type: 'char',
    length: 36,
    nullable: true,
  })
  cliente_id: string | null;

  @OneToMany(() => ItemVenda, (item) => item.venda)
itens: ItemVenda[];

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  total: string;

  @Column({
    type: 'enum',
    enum: VendaStatus,
    default: VendaStatus.CONCLUIDA,
  })
  status: VendaStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}