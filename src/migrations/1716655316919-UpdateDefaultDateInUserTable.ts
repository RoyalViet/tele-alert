import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDefaultDateInUserTable1716655316919
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE user
        ALTER COLUMN updated_at SET DEFAULT (UNIX_TIMESTAMP())
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE user
        ALTER COLUMN updated_at DROP DEFAULT
    `);
  }
}
