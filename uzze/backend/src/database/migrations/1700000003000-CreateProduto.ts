import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProduto1700000003000 implements MigrationInterface {

  name = 'CreateProduto1700000003000';

  public async up( queryRunner: QueryRunner ): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE produtos (
        id CHAR(36) NOT NULL,
        nome VARCHAR(50) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        material VARCHAR(50) NOT NULL,
        tamanho VARCHAR(10) NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        genero ENUM('feminino', 'masculino', 'unissex') NOT NULL,
        modelo VARCHAR(50) NOT NULL,
        quantidade INT NOT NULL DEFAULT 0,
        imagem VARCHAR(255) NULL,
        descricao TEXT NULL,
        fornecedor_id CHAR(36) NOT NULL,
        status ENUM( 'ativo', 'inativo') NOT NULL DEFAULT 'ativo',

        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
         ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (id),

        CONSTRAINT FK_produtos_fornecedor
          FOREIGN KEY (fornecedor_id)
          REFERENCES fornecedores(id)
          ON DELETE RESTRICT
          ON UPDATE CASCADE
      )
    `);
  }

  public async down(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      DROP TABLE produtos
    `);
  }
}