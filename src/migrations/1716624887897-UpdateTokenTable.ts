import { MigrationInterface, QueryRunner, TableUnique } from "typeorm";

export class UpdateTokenTable1716624887897 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE token_info
        ADD UNIQUE INDEX IDX_token_info_pool_id (pool_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE token_info
        DROP INDEX IDX_token_info_pool_id
    `);
  }
}
