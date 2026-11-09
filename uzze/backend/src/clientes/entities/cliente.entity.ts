import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ClienteStatus {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
}

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'varchar', length: 18, unique: true })
  cpf_cnpj: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string | null;

  @Column({ type: 'text', nullable: true })
  observacao: string | null;

  @Column({
    type: 'enum',
    enum: ClienteStatus,
    default: ClienteStatus.ATIVO,
  })
  status: ClienteStatus;

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
