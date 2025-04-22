import { connect } from 'mongoose';


connect('mongodb://127.0.0.1:27017/assets').then(() => {
  console.log('Connection to MongoDB server established');
}).catch(() => {
  console.log('Unable to connect to MongoDB server');
});

connect('mongodb://127.0.0.1:27017/clients').then(() => {
  console.log('Connection to MongoDB server established');
}).catch(() => {
  console.log('Unable to connect to MongoDB server');
});

connect('mongodb://127.0.0.1:27017/traders').then(() => {
  console.log('Connection to MongoDB server established');
}).catch(() => {
  console.log('Unable to connect to MongoDB server');
});