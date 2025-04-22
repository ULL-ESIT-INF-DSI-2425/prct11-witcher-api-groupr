import express from 'express';
import './db/mongoose.js';
import { Client } from './models/client.js';

const app = express()
const port = process.env.PORRT || 3000
app.use(express.json())

// Post requests
app.post('/hunters', (req, res) => {
  const client = new Client(req.body)
  client.save()
  .then((client) => {
    res.status(201).send(client)
  })
  .catch((err) => {
    res.status(400).send({
      error: err
    })
  })
})

//Modifying requests

app.patch('/hunters', (req, res) => {
  if (!req.query.id) {
    res.status(400).send({
      error: 'An ID must be given on query'
    })
  }
  else if (!req.body) {
    res.status(400).send({
      error: 'A body must be provided'
    })
  }
  else {
    const allowedChanges = ['id', 'name', 'race', 'location']
    const actualChanges = Object.keys(req.body)
    const validUpdate = actualChanges.every((value) => allowedChanges.includes(value))
    if (!validUpdate) {
      res.status(400).send({
        error: 'Trying to change a non allowed atribute'
      })
    }
    else {
      Client.findOneAndUpdate({id: Number(req.query.id)}, req.body, {
        new: true,
        runValidators: true
      })
      .then((client) => {
        if (!client) {
          res.status(404).send()
        }
        else {
          res.status(200).send(client)
        }
      })
      .catch((err) => {
        res.status(500).send({
          error: err
        })
      })
    }
  }
})
app.patch('/hunters/:id', (req, res) => {
  if (!req.body) {
    res.status(400).send({
      error: 'Body not ptovided'
    })
  }
  else {
    const allowedChanges = ['id', 'race', 'location', 'name']
    const actualChanges = Object.keys(req.body)
    const isValidChange = actualChanges.every((change) => {return allowedChanges.includes(change)})
    if (!isValidChange) {
      res.status(400).send({
        error: 'Trying to modify a non allowed atribute'
      })
    }
    else {
      Client.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      })
      .then((client) => {
        if (!client) {
          res.status(404).send()
        }
        else {
          res.status(200).send(client)
        }
      })
      .catch((err) => {
        res.status(500).send({
          error: err
        })
      })
    }
  }
})

//Reading requests
app.get('/hunters', (req, res) => {
  const filter = req.query.id? {id: Number(req.query.id)} : {}
  Client.find(filter)
  .then((clients) => {
    if (clients.length === 0) {
      res.status(404).send()
    }
    else {
      res.status(200).send(clients)
    }
  })
  .catch(() => {
    res.status(500).send()
  })
})
app.get('/hunters/:id', (req, res) => {
  Client.findById(req.params.id)
  .then((client) => {
    if (!client) {
      res.status(404).send()
    }
    else {
      res.status(201).send(client)
    }
  })
  .catch((err) => {
    res.status(500).send({
      error: err
    })
  })
})

//Deleting requests
app.delete('/hunters', (req, res) => {
  if (!req.query.id) {
    res.status(400).send({
      error: 'An id must be provided on query'
    })
  }
  else {
    Client.findOneAndDelete({id: Number(req.query.id)})
    .then((client) => {
      if (!client) {
        res.status(404).send()
      }
      else {
        res.status(200).send(client)
      }
    })
    .catch(() => {
      res.status(500).send()
    })
  }
})

app.delete('/hunters/:id', (req, res) => {
  if (!req.params.id) {
    res.status(400).send()
  }
  else {
    Client.findByIdAndDelete(req.params.id)
    .then((client) => {
      if (!client) {
        res.status(400).send({
          error: `Client wiht ID ${req.params.id} not found`
        })
      }
      else {
        res.status(200).send()
      }
    })
    .catch(() => {
      res.status(500).send()
    })
  }
})

app.all('/{*splat}', (_, res) => {
  res.status(501).send()
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
