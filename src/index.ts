import { AppDataSource } from "./data-source";
import express from 'express';
import * as dotenv from 'dotenv';
import brandRoute from './app/routes/brandRoute';
import taskRoute from './app/routes/taskRoute';
import userRoute from './app/routes/userRoute';
import logger from 'morgan';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from "./swaggrOptions";
import { Server as HttpServer } from 'http';
import socketService from './app/services/socketServices';
import { scheduleTaskNotifications } from './utils/cron-job';

dotenv.config();

const app = express();
const httpServer = new HttpServer(app);

app.use(express.json());
app.use(logger("dev"));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.options('*', cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOptions));
app.use('/api/brands', brandRoute);
app.use('/api/tasks', taskRoute);
app.use('/api/users', userRoute);

AppDataSource.initialize()
    .then(() => {
        console.log("Database connected successfully");
    })
    .catch(error => console.log("Database connection failed:", error));

// Initialize the socket service with the HTTP server
socketService.initialize(httpServer);

// Schedule any recurring tasks like notifications
scheduleTaskNotifications();

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
