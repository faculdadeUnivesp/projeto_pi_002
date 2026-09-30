
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnderecos1700000001000 implements MigrationInterface {
  name = 'CreateEnderecos1700000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE enderecos (
        id CHAR(36) NOT NULL,
        cep VARCHAR(9) NOT NULL,
        rua VARCHAR(50) NOT NULL,
        numero VARCHAR(10) NOT NULL,
        bairro VARCHAR(50) NOT NULL,
        cidade VARCHAR(50) NOT NULL,
        estado VARCHAR(2) NOT NULL,
        pais VARCHAR(50) NOT NULL DEFAULT 'Brasil',
        complemento VARCHAR(100) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE enderecos
    `);
  }
}
