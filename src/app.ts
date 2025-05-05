import express from 'express';
import './db/mongoose.js';
import { tradersRouter } from './routers/traders.js';
import { clientRouter } from './routers/clients.js';

export const app = express();
app.use(express.json());
app.use(tradersRouter);
app.use(clientRouter);