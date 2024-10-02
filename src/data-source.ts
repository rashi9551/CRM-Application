import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";                // Adjust the path based on your project structure
import { Team } from "./entity/Team";
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
    database: "user",  // Change this to your actual database name if needed
    synchronize: false,  // Set to true for initial sync (not recommended for production)
    logging: false,
    entities: [
        User,
        Team,
        Brand,
        BrandContact,
        BrandOwnership
    ],
    migrations: ["./src/migration/*.ts"],
    subscribers: [],
    extra: {
        connectionLimit: 10, // Maximum number of connections in the pool
        queueLimit: 0,       // No limit on how many pending connections can be queued
        waitForConnections: true, // Block requests when reaching the max limit
    },
});
