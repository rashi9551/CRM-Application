import { DataSource, Repository } from 'typeorm';
import { User } from '../src/entity/User';                // Adjust the import path as needed
import { Team } from '../src/entity/Team';
import { Brand } from '../src/entity/Brand';
import { BrandContact } from '../src/entity/BrandContact';
import { BrandOwnership } from '../src/entity/BrandOwnership';

const { HOST, DB_PORT, USERNAME, PASSWORD, DATABASE } = process.env;

export class TestHelper {
    private static _instance: TestHelper;
    private dbConnect!: DataSource;

    private constructor() {}

    public static get instance(): TestHelper {
        if (!this._instance) {
            this._instance = new TestHelper();
        }
        return this._instance;
    }

    async setupTestDB() {
        this.dbConnect = new DataSource({
            type: 'mysql',
            host: HOST,
            port: Number(DB_PORT) || 3306,
            username: USERNAME,
            password: PASSWORD,
            database: DATABASE,
            entities: [
                User,
                Team,
                Brand,
                BrandContact,
                BrandOwnership
            ],
            synchronize: true, // Automatically create the schema for testing
            logging: false,
            extra: {
                connectionLimit: 10, // Configure connection pool size if needed
            },
        });

        await this.dbConnect.initialize();
        console.log('Test database connected successfully.');
    }

    async teardownTestDB() {
        if (this.dbConnect.isInitialized) {
            await this.dbConnect.destroy();
            console.log('Test database connection closed.');
        }
    }

    getRepo<T>(entity: new () => T): any{
        return this.dbConnect.getRepository(entity);
    }

    async clearDB() {
        const userRepo = this.getRepo(User);
        const teamRepo = this.getRepo(Team);
        const brandRepo = this.getRepo(Brand);
        const brandContactRepo = this.getRepo(BrandContact);
        const brandOwnershipRepo = this.getRepo(BrandOwnership);

        // Clear all tables
        await Promise.all([
            userRepo.clear(),
            teamRepo.clear(),
            brandRepo.clear(),
            brandContactRepo.clear(),
            brandOwnershipRepo.clear(),
        ]);
        
        console.log('Test database cleared.');
    }
}
