import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1696035600000 implements MigrationInterface {
    name = 'InitialMigration1696035600000'; // Ensure the name matches the class name

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`User\` (
            \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            \`name\` VARCHAR(255) NOT NULL,
            \`department\` VARCHAR(255) NOT NULL,
            \`phone_number\` VARCHAR(255) NOT NULL,
            \`password\` VARCHAR(255) NOT NULL,  -- Added password field
            \`email\` VARCHAR(255) UNIQUE NOT NULL,
            \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Changed to camel case
            \`parent_id\` INT NULL,  -- Added parent_id field
            FOREIGN KEY (\`parent_id\`) REFERENCES \`User\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE  -- Foreign key referencing the same table
        ) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`Role\` (
            \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            \`role_name\` ENUM('ADMIN', 'PO', 'BO', 'TO') NOT NULL,
            \`user_id\` INT NULL,
            \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Changed to camel case
            FOREIGN KEY (\`user_id\`) REFERENCES \`User\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        ) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`Team\` (
            \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            \`to_user_id\` INT NULL,
            \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Changed to camel case
            FOREIGN KEY (\`to_user_id\`) REFERENCES \`User\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        ) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`UserTeam\` (
            \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            \`user_id\` INT NULL,
            \`team_id\` INT NULL,
            \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Changed to camel case
            FOREIGN KEY (\`user_id\`) REFERENCES \`User\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
            FOREIGN KEY (\`team_id\`) REFERENCES \`Team\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        ) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`Brand\` (
            \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            \`brand_name\` VARCHAR(255) NOT NULL,
            \`revenue\` DECIMAL NOT NULL,
            \`deal_closed_value\` DECIMAL NOT NULL,
            \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Changed to camel case
        ) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`BrandContact\` (
            \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            \`brand_id\` INT NULL,
            \`contact_person_name\` VARCHAR(255) NOT NULL,
            \`contact_person_phone\` VARCHAR(255) NOT NULL,
            \`contact_person_email\` VARCHAR(255) NOT NULL,
            \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Changed to camel case
            FOREIGN KEY (\`brand_id\`) REFERENCES \`Brand\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        ) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`BrandOwnership\` (
            \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            \`brand_id\` INT NULL,
            \`bo_user_id\` INT NULL,
            \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Changed to camel case
            FOREIGN KEY (\`brand_id\`) REFERENCES \`Brand\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
            FOREIGN KEY (\`bo_user_id\`) REFERENCES \`User\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        ) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`BrandOwnership\``);
        await queryRunner.query(`DROP TABLE \`BrandContact\``);
        await queryRunner.query(`DROP TABLE \`Brand\``);
        await queryRunner.query(`DROP TABLE \`UserTeam\``);
        await queryRunner.query(`DROP TABLE \`Team\``);
        await queryRunner.query(`DROP TABLE \`Role\``);
        await queryRunner.query(`DROP TABLE \`User\``);
    }
}
