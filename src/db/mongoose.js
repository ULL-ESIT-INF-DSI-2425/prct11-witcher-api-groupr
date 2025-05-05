"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionsDB = exports.tradersDB = exports.clientsDB = exports.assetsDB = void 0;
var mongoose_1 = require("mongoose");
// Crear conexiones separadas para cada base de datos
exports.assetsDB = mongoose_1.default.createConnection('mongodb://127.0.0.1:27017/assets');
exports.clientsDB = mongoose_1.default.createConnection('mongodb://127.0.0.1:27017/clients');
exports.tradersDB = mongoose_1.default.createConnection('mongodb://127.0.0.1:27017/traders');
exports.transactionsDB = mongoose_1.default.createConnection('mongodb://127.0.0.1:27017/transactions');
// Manejo de eventos de conexión
exports.assetsDB.on('connected', function () { return console.log('Connected to assets database'); });
exports.clientsDB.on('connected', function () { return console.log('Connected to clients database'); });
exports.tradersDB.on('connected', function () { return console.log('Connected to traders database'); });
exports.transactionsDB.on('connected', function () { return console.log('Conected to transactions database'); });
