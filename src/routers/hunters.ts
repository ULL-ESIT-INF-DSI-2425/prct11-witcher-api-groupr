import express from 'express';
import '../db/mongoose.js';
import { Hunter } from '../models/hunters.js';

export const hunterApp = express.Router()

hunterApp.use(express.json())

// Post requests
hunterApp.post('/hunters', async (req, res) => {
  if (!req.body) {
    res.status(400).send('Hunter`s characteristics must be given on the body')
  }
  else {
    try {
      const hunter = new Hunter(req.body)
      await hunter.save()
      res.status(201).send(hunter)
    }
    catch (err) {
      res.status(500).send({
        error: err
      })
    }
  }
})

//Modifying requests

hunterApp.patch('/hunters', async (req, res) => {
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
        const hunter = await Hunter.findOneAndUpdate(req.body, {
          new: true,
          runValidators: true
        })
        if (!hunter) {
          res.status(404).send()
        }
        else {
          res.status(200).send(hunter)
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

hunterApp.patch('/hunters/:id', async (req, res) => {
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
        const hunter = await Hunter.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
        })
        if (!hunter) {
          res.status(404).send()
        }
        else {
          res.status(200).send(hunter)
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
hunterApp.get('/hunters', async (req, res) => {
  const filter = req.query.name? {name: req.query.name} : {}
  try {
    const hunters = await Hunter.find(filter)
    if (hunters.length === 0) {
      res.status(404).send()
    }
    else {
      res.status(200).send(hunters)
    }
  }
  catch(err) {
    res.status(500).send(err)
  }
})

hunterApp.get('/hunters/:id', async (req, res) => {
  try {
    const hunter = await Hunter.findById(req.params.id)
    if (!hunter) {
      res.status(404).send()
    }
    else {
      res.status(201).send(hunter)
    }
  }
  catch(err) {
    res.status(500).send({
      error: err
    })
  }
})

//Deleting requests
hunterApp.delete('/hunters', async (req, res) => {
  if (!req.query.name) {
    res.status(400).send({
      error: 'A name must be provided on query'
    })
  }
  else {
    try {
      const hunter = await Hunter.findOneAndDelete({name: req.query.name})
      if (!hunter) {
        res.status(404).send()
      }
      else {
        res.status(200).send(hunter)
      }
    }
    catch (err) {
      res.status(500).send(err)
    }
  }
})

hunterApp.delete('/hunters/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).send()
  }
  else {
    try {
      const hunter = await Hunter.findByIdAndDelete(req.params.id)
      if (!hunter) {
        res.status(400).send({
          error: `Hunter wiht ID ${req.params.id} not found`
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

hunterApp.all('/{*splat}', (_, res) => {
  res.status(501).send()
})
