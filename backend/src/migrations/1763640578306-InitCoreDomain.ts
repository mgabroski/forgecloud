import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitCoreDomain1763640578306 implements MigrationInterface {
  name = 'InitCoreDomain1763640578306';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "active_organization_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_b6efb6c252106821c8bd822af86" FOREIGN KEY ("active_organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_b6efb6c252106821c8bd822af86"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "active_organization_id"`);
  }
}
