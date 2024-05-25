import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTokenTable1716558105566 implements MigrationInterface {
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
          },
          {
            name: "token_account_ids",
            type: "varchar",
            length: "255",
            isNullable: false,
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
          },
          {
            name: "created_at",
            type: "bigint",
          },
          {
            name: "updated_at",
            type: "bigint",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
