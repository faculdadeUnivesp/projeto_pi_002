import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsuarios1700000000000 implements MigrationInterface {
  name = 'CreateUsuarios1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'usuarios',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'nome',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'cpf',
            type: 'varchar',
            length: '14',
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'senha_hash',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'foto',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'tipo',
            type: 'enum',
            enum: ['vendedor', 'admin'],
            default: "'vendedor'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ativo', 'inativo'],
            default: "'ativo'",
          },
          {
            name: 'ultimo_acesso',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'refresh_token',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('usuarios');
  }
}
