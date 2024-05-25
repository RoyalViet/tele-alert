import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTokenTable1716655551157 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "token_info",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "token_contract",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "token_account_ids",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "token_symbols",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "token_price",
            type: "double",
            default: "0",
          },
          {
            name: "liq",
            type: "float",
            default: "0",
          },
          {
            name: "pool_id",
            type: "int",
            default: "0",
          },
          {
            name: "network",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "bigint",
            default: "(UNIX_TIMESTAMP())",
          },
          {
            name: "updated_at",
            type: "bigint",
            default: "(UNIX_TIMESTAMP())",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("token_info");
  }
}
