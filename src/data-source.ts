import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";                // Adjust the path based on your project structure
import { Role } from "./entity/Role";
import { Team } from "./entity/Team";
import { UserTeam } from "./entity/UserTeam";
import { Brand } from "./entity/Brand";
import { BrandContact } from "./entity/BrandContact";
import { BrandOwnership } from "./entity/BrandOwnership";
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: "typeOrm",  // Change this to your actual database name if needed
    synchronize: false,  // Set to true for initial sync (not recommended for production)
    logging: false,
    entities: [
        User,
        Role,
        Team,
        UserTeam,
        Brand,
        BrandContact,
        BrandOwnership
    ],
    migrations: ["./src/migration/*.ts"],
    subscribers: [],
});
