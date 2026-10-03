
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFornecedores1700000002000 implements MigrationInterface {
  name = 'CreateFornecedores1700000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE fornecedores (
        id CHAR(36) NOT NULL,
        nome VARCHAR(20) NOT NULL,
        cnpj VARCHAR(18) NOT NULL,
        email VARCHAR(40) NOT NULL,
        contato VARCHAR(11) NOT NULL,
        endereco_id CHAR(36) NOT NULL,
        status ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (id),

        UNIQUE KEY UQ_fornecedores_cnpj (cnpj),

        CONSTRAINT FK_fornecedores_endereco
          FOREIGN KEY (endereco_id)
          REFERENCES enderecos(id)
          ON DELETE RESTRICT
          ON UPDATE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE fornecedores
    `);
  }
}
