import mongoose from 'mongoose';

// Crear conexiones separadas para cada base de datos
export const assetsDB = mongoose.createConnection('mongodb://127.0.0.1:27017/assets');

export const clientsDB = mongoose.createConnection('mongodb://127.0.0.1:27017/clients');

export const tradersDB = mongoose.createConnection('mongodb://127.0.0.1:27017/traders');

// Manejo de eventos de conexión
assetsDB.on('connected', () => console.log('Connected to assets database'));
clientsDB.on('connected', () => console.log('Connected to clients database'));
tradersDB.on('connected', () => console.log('Connected to traders database'));