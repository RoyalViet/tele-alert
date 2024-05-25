import { MigrationInterface, QueryRunner, getRepository } from "typeorm";
import { Token } from "../entities/token/token.entity";
import { tokenSeed } from "../seeds/token.seed";

export class SeedTokenTable1716655672646 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await getRepository(Token).save(tokenSeed);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
