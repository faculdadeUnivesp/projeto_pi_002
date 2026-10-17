import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FornecedorEmailContatoOpcional1710000000000
  implements MigrationInterface
{
  name = 'FornecedorEmailContatoOpcional1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE fornecedores
        MODIFY email VARCHAR(255) NULL,
        MODIFY contato VARCHAR(20) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE fornecedores
        MODIFY email VARCHAR(255) NOT NULL,
        MODIFY contato VARCHAR(20) NOT NULL
    `);
  }
}
