import type { MigrationInterface, QueryRunner } from 'typeorm';

export class VendaCliente1720000000100 implements MigrationInterface {
  name = 'VendaCliente1720000000100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE vendas
        ADD COLUMN cliente_id CHAR(36) NULL,
        ADD CONSTRAINT FK_vendas_cliente
          FOREIGN KEY (cliente_id)
          REFERENCES clientes(id)
          ON DELETE SET NULL
          ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE vendas
        DROP FOREIGN KEY FK_vendas_cliente,
        DROP COLUMN cliente_id
    `);
  }
}
