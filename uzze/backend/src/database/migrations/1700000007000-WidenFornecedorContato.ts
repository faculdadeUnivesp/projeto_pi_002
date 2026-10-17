import type { MigrationInterface, QueryRunner } from 'typeorm';

export class WidenFornecedorContato1700000007000
  implements MigrationInterface
{
  name = 'WidenFornecedorContato1700000007000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE fornecedores
        MODIFY contato VARCHAR(20) NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE fornecedores
        MODIFY contato VARCHAR(11) NOT NULL
    `);
  }
}
