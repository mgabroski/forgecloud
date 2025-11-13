import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitCoreDomain1763073121690 implements MigrationInterface {
  name = 'InitCoreDomain1763073121690';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."organization_memberships_role_enum" AS ENUM('OWNER', 'ADMIN', 'MEMBER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organization_memberships_status_enum" AS ENUM('INVITED', 'ACTIVE', 'SUSPENDED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "organization_memberships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "role" "public"."organization_memberships_role_enum" NOT NULL DEFAULT 'MEMBER', "status" "public"."organization_memberships_status_enum" NOT NULL DEFAULT 'INVITED', "invited_by_user_id" uuid, "invited_at" TIMESTAMP WITH TIME ZONE, "joined_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "uq_org_membership_user_org" UNIQUE ("user_id", "organization_id"), CONSTRAINT "PK_cd7be805730a4c778a5f45364af" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."projects_status_enum" AS ENUM('ACTIVE', 'ARCHIVED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."projects_visibility_enum" AS ENUM('PRIVATE', 'INTERNAL', 'PUBLIC')`,
    );
    await queryRunner.query(
      `CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "name" character varying NOT NULL, "project_key" character varying NOT NULL, "description" text, "status" "public"."projects_status_enum" NOT NULL DEFAULT 'ACTIVE', "visibility" "public"."projects_visibility_enum" NOT NULL DEFAULT 'PRIVATE', "created_by_user_id" uuid NOT NULL, "last_updated_by_user_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organizations_plan_enum" AS ENUM('free', 'pro', 'enterprise')`,
    );
    await queryRunner.query(
      `CREATE TABLE "organizations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "plan" "public"."organizations_plan_enum" NOT NULL DEFAULT 'free', "is_active" boolean NOT NULL DEFAULT true, "owner_user_id" uuid, "created_by_user_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_963693341bd612aa01ddf3a4b68" UNIQUE ("slug"), CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_auth_provider_enum" AS ENUM('local', 'google', 'github', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" text, "auth_provider" "public"."users_auth_provider_enum" NOT NULL DEFAULT 'local', "full_name" character varying, "avatar_url" character varying, "is_active" boolean NOT NULL DEFAULT true, "last_login_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_memberships" ADD CONSTRAINT "FK_5352fc550034d507d6c76dd2901" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_memberships" ADD CONSTRAINT "FK_86ae2efbb9ce84dd652e0c96a49" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_memberships" ADD CONSTRAINT "FK_af961830a014efa444dc801af78" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_585c8ce06628c70b70100bfb842" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_9b4b555ca01bd035b4879ed4fce" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_55104d65e7da0117aa52fe282b6" FOREIGN KEY ("last_updated_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD CONSTRAINT "FK_a8afaf18799fd187cbe8e998dcd" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD CONSTRAINT "FK_f1b627e9fd9dfa32df7fde3b987" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP CONSTRAINT "FK_f1b627e9fd9dfa32df7fde3b987"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP CONSTRAINT "FK_a8afaf18799fd187cbe8e998dcd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_55104d65e7da0117aa52fe282b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_9b4b555ca01bd035b4879ed4fce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_585c8ce06628c70b70100bfb842"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_memberships" DROP CONSTRAINT "FK_af961830a014efa444dc801af78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_memberships" DROP CONSTRAINT "FK_86ae2efbb9ce84dd652e0c96a49"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_memberships" DROP CONSTRAINT "FK_5352fc550034d507d6c76dd2901"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_auth_provider_enum"`);
    await queryRunner.query(`DROP TABLE "organizations"`);
    await queryRunner.query(`DROP TYPE "public"."organizations_plan_enum"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TYPE "public"."projects_visibility_enum"`);
    await queryRunner.query(`DROP TYPE "public"."projects_status_enum"`);
    await queryRunner.query(`DROP TABLE "organization_memberships"`);
    await queryRunner.query(`DROP TYPE "public"."organization_memberships_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."organization_memberships_role_enum"`);
  }
}
