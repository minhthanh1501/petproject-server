import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1789527857310 implements MigrationInterface {
    name = 'InitMigration1789527857310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "params" SET DEFAULT '{}'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "params" SET DEFAULT '{}'`);
    }

}

