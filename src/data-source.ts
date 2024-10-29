import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";               
import { Team } from "./entity/Team";
import { Brand } from "./entity/Brand";
import { BrandContact } from "./entity/BrandContact";
import { BrandOwnership } from "./entity/BrandOwnership";
import * as dotenv from 'dotenv';
import { Task } from "./entity/Task";
import { Event } from "./entity/Event";
import { TaskComment } from "./entity/TaskComment";
import { TaskHistory } from "./entity/TaskHistory";
import { Notification } from "./entity/Notification";
import { Inventory } from "./entity/inventory";
import { Contributes } from "./entity/Contributes";

dotenv.config();

const isProduction = process.env.NODE_ENV === 'pro';

export const AppDataSource = new DataSource({
    type: 'mysql',
    url: isProduction ? process.env.MYSQL_PUBLIC_URL : `mysql://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}:${process.env.DB_PORT}/${process.env.DATABASE}`,
    synchronize: true,
    logging: false,
    entities: [
        User,
        Team,
        Brand,
        BrandContact,
        BrandOwnership,
        Task,
        TaskComment,
        TaskHistory,
        Notification,
        Inventory,
        Event,
        Contributes

        
    ],
    migrations: ["./migration/*.ts"],
    subscribers: [],
    extra: {
        connectionLimit: 10,  // Maximum number of connections in the pool
        queueLimit: 0,        // No limit on how many pending connections can be queued
        waitForConnections: true, // Block requests when reaching the max limit
    },
});
