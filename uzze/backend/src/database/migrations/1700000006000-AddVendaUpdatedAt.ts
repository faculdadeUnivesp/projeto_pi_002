import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVendaUpdatedAt1700000006000 implements MigrationInterface {
  name = 'AddVendaUpdatedAt1700000006000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE vendas
        ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE vendas
        DROP COLUMN updated_at
    `);
  }
}
