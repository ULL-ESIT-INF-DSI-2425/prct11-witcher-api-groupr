import express from 'express';
import './db/mongoose.js';
import { Note } from './models/note.js';
import {clientApp} from './client_server.js'

const app = express();
const port = process.env.PORT || 3000;

app.use(clientApp)

app.use(express.json());

app.post('/notes', async (req, res) => {
  const note = new Note(req.body);
  try {
    let note2 = await note.save()
    res.send(note2);
  }
  catch(error) {
    res.send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});