// import { MigrationInterface, QueryRunner } from "typeorm";

// export class UpdateDefaultDateInTokenTable1716627676216
//   implements MigrationInterface
// {
//   public async up(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.query(`
//         ALTER TABLE token_info
//         ALTER COLUMN created_at SET DEFAULT UNIX_TIMESTAMP()
//     `);
//   }
//   // ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.query(`
//         ALTER TABLE token_info
//         ALTER COLUMN created_at DROP DEFAULT
//     `);
//     // ALTER COLUMN updated_at DROP DEFAULT
//   }
// }
