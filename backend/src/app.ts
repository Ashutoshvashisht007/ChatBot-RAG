import express from 'express';
import bodyParser from 'body-parser';
import chatRoutes from './routes/chat.routes';
import ingestRoutes from './routes/ingest.routes';
import dotenv from "dotenv";
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));
dotenv.config();

app.use('/api', ingestRoutes);

app.use('/api', chatRoutes);

export default app;