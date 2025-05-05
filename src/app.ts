import express from 'express';
import './db/mongoose.js';
import { tradersRouter } from './routers/traders.js';
import { clientApp } from './routers/clients.js';
import {Assetrouter} from './routers/server_assets.js'

export const app = express();
app.use(express.json());
app.use(tradersRouter);
app.use(clientApp);
app.use(Assetrouter)