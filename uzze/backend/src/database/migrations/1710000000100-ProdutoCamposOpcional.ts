import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ProdutoCamposOpcional1710000000100
  implements MigrationInterface
{
  name = 'ProdutoCamposOpcional1710000000100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE produtos
        MODIFY material VARCHAR(50) NULL,
        MODIFY tamanho VARCHAR(10) NULL,
        MODIFY modelo VARCHAR(50) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE produtos
        MODIFY material VARCHAR(50) NOT NULL,
        MODIFY tamanho VARCHAR(10) NOT NULL,
        MODIFY modelo VARCHAR(50) NOT NULL
    `);
  }
}
