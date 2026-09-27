import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('itens_venda')
export class ItemVenda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
  })
  venda_id: string;

  @ManyToOne('Venda', 'itens', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'venda_id' })
  venda: any;

  @Column({
    type: 'uuid',
  })
  produto_id: string;

  @Column({
    type: 'int',
  })
  quantidade: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  valor_unitario: string;
}