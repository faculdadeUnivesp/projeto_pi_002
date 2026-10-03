import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVendas1700000004000 implements MigrationInterface {
  name = 'CreateVendas1700000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE vendas (
        id CHAR(36) NOT NULL,
        numero_venda VARCHAR(20) NOT NULL,
        data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        forma_pagamento ENUM('dinheiro', 'cartao', 'pix') NOT NULL,
        vendedor_id CHAR(36) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status ENUM('concluida', 'cancelada') NOT NULL DEFAULT 'concluida',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY UQ_vendas_numero_venda (numero_venda),
        CONSTRAINT FK_vendas_vendedor
          FOREIGN KEY (vendedor_id)
          REFERENCES usuarios(id)
          ON DELETE RESTRICT
          ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE itens_venda (
       id CHAR(36) NOT NULL,
       venda_id CHAR(36) NOT NULL,
       produto_id CHAR(36) NOT NULL,
       quantidade INT NOT NULL,
       valor_unitario DECIMAL(10,2) NOT NULL,
       PRIMARY KEY (id),

       CONSTRAINT FK_itens_venda_venda
         FOREIGN KEY (venda_id)
         REFERENCES vendas(id)
         ON DELETE CASCADE
         ON UPDATE CASCADE,

       CONSTRAINT FK_itens_venda_produto
         FOREIGN KEY (produto_id)
         REFERENCES produtos(id)
         ON DELETE RESTRICT
         ON UPDATE CASCADE
     )
   `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE itens_venda
    `);

    await queryRunner.query(`
      DROP TABLE vendas
    `);
  }
}