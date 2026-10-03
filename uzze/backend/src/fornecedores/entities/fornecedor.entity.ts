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
    length: 20,
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
    length: 40,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 11,
  })
  contato: string;

  @Column({
    name: 'endereco_id',
    type: 'char',
    length: 36,
  })
  endereco_id: string;

  @OneToOne(() => Endereco, {
    eager: true,
  })
  @JoinColumn({
    name: 'endereco_id',
  })
  endereco: Endereco;

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