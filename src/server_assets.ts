import {AssetModel } from './bienes.js';
import express from 'express';
import './db/mongoose.js'; // Las 3 bases de datos


const app = express();
const port = process.env.PORT || 3000

app.use(express.json())

app.post('/assets', (req, res) => {
})