import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlteraFornecedoresTamanhos1700000005000
  implements MigrationInterface
{
  name = 'AlteraFornecedoresTamanhos1700000005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE fornecedores
        MODIFY nome VARCHAR(255) NOT NULL,
        MODIFY email VARCHAR(255) NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE fornecedores
        MODIFY nome VARCHAR(20) NOT NULL,
        MODIFY email VARCHAR(40) NOT NULL
    `);
  }
}
