import express from 'express';
import './db/mongoose.js';
import { Client } from './models/client.js';

export const clientApp = express.Router()

clientApp.use(express.json())

// Post requests
clientApp.post('/hunters', async (req, res) => {
  if (!req.body) {
    res.status(400).send('Hunter`s characteristics must be given on the body')
  }
  else {
    try {
      const client = new Client(req.body)
      await client.save()
      res.status(201).send(client)
    }
    catch (err) {
      res.status(500).send({
        error: err
      })
    }
  }
})

//Modifying requests

clientApp.patch('/hunters', async (req, res) => {
  if (!req.query.name) {
    res.status(400).send({
      error: 'A Name must be given on query'
    })
  }
  else if (!req.body) {
    res.status(400).send({
      error: 'A body must be provided'
    })
  }
  else {
    const allowedChanges = ['name', 'race', 'location']
    const actualChanges = Object.keys(req.body)
    const validUpdate = actualChanges.every((value) => allowedChanges.includes(value))
    if (!validUpdate) {
      res.status(400).send({
        error: 'Trying to change a non allowed atribute'
      })
    }
    else {
      try {
        const client = await Client.findOneAndUpdate(req.body, {
          new: true,
          runValidators: true
        })
        if (!client) {
          res.status(404).send()
        }
        else {
          res.status(200).send(client)
        }
      }
      catch(err) {
        res.status(500).send({
          error: err
        })
      }
    }
  }
})

clientApp.patch('/hunters/:id', async (req, res) => {
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
      try {
        const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
        })
        if (!client) {
          res.status(404).send()
        }
        else {
          res.status(200).send(client)
        }
      }
      catch(err)  {
        res.status(500).send({
          error: err
        })
      }
    }
  }
})

//Reading requests
clientApp.get('/hunters', async (req, res) => {
  const filter = req.query.name? {name: req.query.name} : {}
  try {
    const clients = await Client.find(filter)
    if (clients.length === 0) {
      res.status(404).send()
    }
    else {
      res.status(200).send(clients)
    }
  }
  catch(err) {
    res.status(500).send(err)
  }
})

clientApp.get('/hunters/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
    if (!client) {
      res.status(404).send()
    }
    else {
      res.status(201).send(client)
    }
  }
  catch(err) {
    res.status(500).send({
      error: err
    })
  }
})

//Deleting requests
clientApp.delete('/hunters', async (req, res) => {
  if (!req.query.name) {
    res.status(400).send({
      error: 'A name must be provided on query'
    })
  }
  else {
    try {
      const client = await Client.findOneAndDelete({name: req.query.name})
      if (!client) {
        res.status(404).send()
      }
      else {
        res.status(200).send(client)
      }
    }
    catch (err) {
      res.status(500).send(err)
    }
  }
})

clientApp.delete('/hunters/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).send()
  }
  else {
    try {
      const client = await Client.findByIdAndDelete(req.params.id)
      if (!client) {
        res.status(400).send({
          error: `Client wiht ID ${req.params.id} not found`
        })
      }
      else {
        res.status(200).send()
      }
    }
    catch(err) {
      res.status(500).send(err)
    }
  }
})

clientApp.all('/{*splat}', (_, res) => {
  res.status(501).send()
})
