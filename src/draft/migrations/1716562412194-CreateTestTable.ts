import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTestTable1716562412194 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "test",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "created_at",
            type: "bigint",
          },
          {
            name: "updated_at",
            type: "bigint",
          },
          {
            name: "email",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "password",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "firstName",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "lastName",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "isDeleted",
            type: "tinyint",
            default: "0",
          },
        ],
        uniques: [
          {
            columnNames: ["email"],
          },
        ],
      })
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
