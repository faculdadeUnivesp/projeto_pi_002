import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ProdutoFornecedorOpcional1700000009000
  implements MigrationInterface
{
  name = 'ProdutoFornecedorOpcional1700000009000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE produtos
        MODIFY fornecedor_id CHAR(36) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE produtos
        MODIFY fornecedor_id CHAR(36) NOT NULL
    `);
  }
}
