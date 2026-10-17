import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Endereco } from '../../endereco/entities/endereco.entity.js';

export enum FornecedorStatus {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
}

@Entity('fornecedores')
export class Fornecedor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  nome: string;

  @Column({
    type: 'varchar',
    length: 18,
    unique: true,
  })
  cnpj: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  contato: string | null;

  @Column({
    name: 'endereco_id',
    type: 'char',
    length: 36,
    nullable: true,
  })
  endereco_id: string | null;

  @OneToOne(() => Endereco, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({
    name: 'endereco_id',
  })
  endereco: Endereco | null;

  @Column({
    type: 'enum',
    enum: FornecedorStatus,
    default: FornecedorStatus.ATIVO,
  })
  status: FornecedorStatus;

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