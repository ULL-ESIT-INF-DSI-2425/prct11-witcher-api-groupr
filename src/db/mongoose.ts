// import mongoose from 'mongoose';

//mongodb/bin/mongod --dbpath mongodb-data/
// Crear conexiones separadas para cada base de datos

// const mongoDB = process.env.ClusterMONGODB_URL || 'mongodb://localhost:27017';

// export const assetsDB = mongoose.createConnection(`${mongoDB}/assets`);

// export const huntersDB = mongoose.createConnection(`${mongoDB}/hunters`);

// export const tradersDB = mongoose.createConnection(`${mongoDB}/traders`);

// export const transactionsDB = mongoose.createConnection(`${mongoDB}/transactions`)

// // Manejo de eventos de conexión
// assetsDB.on('connected', () => console.log('Connected to assets database'));
// huntersDB.on('connected', () => console.log('Connected to hunters database'));
// tradersDB.on('connected', () => console.log('Connected to traders database'));
// transactionsDB.on('connected', () => console.log('Conected to transactions database'))

import { connect } from "mongoose";

try {
  await connect(process.env.ClusterMONGODB_URL!);
  console.log("Connection to MongoDB server established");
} catch (error) {
  console.log(error);
}