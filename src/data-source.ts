import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";  // Adjust the path based on your project structure
import { Team } from "./entity/Team";
import { Brand } from "./entity/Brand";
import { BrandContact } from "./entity/BrandContact";
import { BrandOwnership } from "./entity/BrandOwnership";
import * as dotenv from 'dotenv';
dotenv.config();

console.log(process.env.MYSQL_PUBLIC_URL,process.env.DATABASE, "=-=-");

export const AppDataSource = new DataSource({
  type: 'mysql',
  url: process.env.MYSQL_PUBLIC_URL,  // Use the public URL for Railway
  database: process.env.DATABASE,  // Specify your database name here
  synchronize: false,
  logging: true,  // Set to true for detailed logs
  entities: [User, Team, Brand, BrandContact, BrandOwnership],
  migrations: ["./src/migration/*.ts"],
  subscribers: [],
  extra: {
    connectionLimit: 10,
    queueLimit: 0,
    waitForConnections: true,
  },
});
