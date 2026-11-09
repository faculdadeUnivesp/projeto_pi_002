import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClientes1720000000000 implements MigrationInterface {
  name = 'CreateClientes1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE clientes (
        id CHAR(36) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        cpf_cnpj VARCHAR(18) NOT NULL,
        email VARCHAR(255) NULL,
        telefone VARCHAR(20) NULL,
        observacao TEXT NULL,
        status ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY UQ_clientes_cpf_cnpj (cpf_cnpj)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE clientes`);
  }
}
