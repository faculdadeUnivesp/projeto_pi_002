import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UsuarioTipo {
  VENDEDOR = 'vendedor',
  ADMIN = 'admin',
}

export enum UsuarioStatus {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'varchar', length: 14, unique: true })
  cpf: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  senha_hash: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  foto: string;

  @Column({ type: 'enum', enum: UsuarioTipo, default: UsuarioTipo.VENDEDOR })
  tipo: UsuarioTipo;

  @Column({ type: 'enum', enum: UsuarioStatus, default: UsuarioStatus.ATIVO })
  status: UsuarioStatus;

  @Column({ type: 'timestamp', nullable: true })
  ultimo_acesso: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refresh_token: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
