import { AppDataSource } from "./data-source";
import express from 'express';
import * as dotenv from 'dotenv';
import route from './app/routes/route';
import logger from 'morgan'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from "./swaggrOptions";

dotenv.config();

const app = express();

app.use(express.json());
app.use(logger("dev"))

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true, 
}));



app.options('*', cors()); 

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOptions));

app.use('/api', route);

AppDataSource.initialize()
    .then(() => {
        console.log("Database connected successfully");
    })
    .catch(error => console.log("Database connection failed:", error));

const PORT = process.env.PORT ;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
