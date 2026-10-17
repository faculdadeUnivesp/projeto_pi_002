import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FornecedorEnderecoOpcional1700000008000
  implements MigrationInterface
{
  name = 'FornecedorEnderecoOpcional1700000008000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE fornecedores
        MODIFY endereco_id CHAR(36) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE fornecedores
        MODIFY endereco_id CHAR(36) NOT NULL
    `);
  }
}
