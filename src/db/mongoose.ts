import mongoose from 'mongoose';

// Crear conexiones separadas para cada base de datos
export const assetsDB = mongoose.createConnection('mongodb://127.0.0.1:27017/assets');

export const huntersDB = mongoose.createConnection('mongodb://127.0.0.1:27017/hunters');

export const tradersDB = mongoose.createConnection('mongodb://127.0.0.1:27017/traders');

export const transactionsDB = mongoose.createConnection('mongodb://127.0.0.1:27017/transactions')

// Manejo de eventos de conexión
assetsDB.on('connected', () => console.log('Connected to assets database'));
huntersDB.on('connected', () => console.log('Connected to hunters database'));
tradersDB.on('connected', () => console.log('Connected to traders database'));
transactionsDB.on('connected', () => console.log('Conected to transactions database'))