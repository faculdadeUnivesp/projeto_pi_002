import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('enderecos')
export class Endereco {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 9 })
  cep: string;

  @Column({ type: 'varchar', length: 50 })
  rua: string;

  @Column({ type: 'varchar', length: 10 })
  numero: string;

  @Column({ type: 'varchar', length: 50 })
  bairro: string;

  @Column({ type: 'varchar', length: 50 })
  cidade: string;

  @Column({ type: 'varchar', length: 2 })
  estado: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'Brasil',
  })
  pais: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  complemento: string | null;

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