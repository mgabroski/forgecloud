import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitCoreDomain1764062386276 implements MigrationInterface {
  name = 'InitCoreDomain1764062386276';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "log_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "project_id" uuid, "source_id" uuid NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "level" character varying(20) NOT NULL, "message" text NOT NULL, "context" jsonb, "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b226cc4051321f12106771581e0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "log_sources" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "project_id" uuid, "name" character varying(191) NOT NULL, "type" character varying(50) NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'active', "description" text, "environment" character varying(50), "ingest_key" character varying(255), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_292d8e5639fbd70305e28c59c05" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "log_entries" ADD CONSTRAINT "FK_193a04e2f60bc1e96125fbd0274" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "log_entries" ADD CONSTRAINT "FK_6ffd129226d95b5f80a195286fb" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "log_entries" ADD CONSTRAINT "FK_05759fe03de50940fe7e3da2d20" FOREIGN KEY ("source_id") REFERENCES "log_sources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "log_sources" ADD CONSTRAINT "FK_b1f288266c618d14be4666177dc" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "log_sources" ADD CONSTRAINT "FK_3f95befd64b8823d71f2dad7eba" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "log_sources" DROP CONSTRAINT "FK_3f95befd64b8823d71f2dad7eba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "log_sources" DROP CONSTRAINT "FK_b1f288266c618d14be4666177dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "log_entries" DROP CONSTRAINT "FK_05759fe03de50940fe7e3da2d20"`,
    );
    await queryRunner.query(
      `ALTER TABLE "log_entries" DROP CONSTRAINT "FK_6ffd129226d95b5f80a195286fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "log_entries" DROP CONSTRAINT "FK_193a04e2f60bc1e96125fbd0274"`,
    );
    await queryRunner.query(`DROP TABLE "log_sources"`);
    await queryRunner.query(`DROP TABLE "log_entries"`);
  }
}
