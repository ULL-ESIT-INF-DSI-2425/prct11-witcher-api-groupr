import express from 'express';
import './db/mongoose.js';
import { tradersRouter } from './routers/traders.js';
import { hunterApp } from './routers/hunters.js';
import {Assetrouter} from './routers/assets.js'
import { transactionApp } from './routers/transactions.js';

export const app = express();
app.use(express.json());
app.use(tradersRouter);
app.use(hunterApp);
app.use(Assetrouter)
app.use(transactionApp)