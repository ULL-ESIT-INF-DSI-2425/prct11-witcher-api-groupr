import express from 'express';
import '../db/mongoose.js';
import { Hunter } from '../models/hunters.js';

export const hunterApp = express.Router()

hunterApp.use(express.json())

/**
 * @route POST /hunters
 * @summary Create a new hunter
 * @param {object} req.body - Hunter data (must match Hunter schema)
 * @returns 201 - Hunter created successfully
 * @returns 400 - Request body not provided
 * @returns 500 - Server error
 */

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

/**
 * @route PATCH /hunters
 * @summary Update a hunter by name (provided via query param)
 * @param {string} req.query.name - Name of the hunter to update
 * @param {object} req.body - Attributes to update
 * @returns 200 - Hunter updated successfully
 * @returns 400 - Missing name query or body, or invalid attributes
 * @returns 404 - Hunter not found
 * @returns 500 - Server error
 */

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
        const hunter = await Hunter.findOneAndUpdate({ name: req.query.name }, req.body, {
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

/**
 * @route PATCH /hunters/{id}
 * @summary Update a hunter by ID
 * @param {string} id.path.required - Hunter ID
 * @param {object} req.body - Attributes to update
 * @returns 200 - Hunter updated successfully
 * @returns 400 - Request body missing or invalid attributes
 * @returns 404 - Hunter not found
 * @returns 500 - Server error
 */

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

/**
 * @route GET /hunters
 * @summary Get all hunters or filter by name
 * @param {string} [req.query.name] - Optional name filter
 * @returns 200 - Hunters retrieved successfully
 * @returns 404 - No hunters found
 * @returns 500 - Server error
 */

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


/**
 * @route GET /hunters/{id}
 * @summary Get a hunter by ID
 * @param {string} id.path.required - Hunter ID
 * @returns 200 - Hunter found
 * @returns 404 - Hunter not found
 * @returns 500 - Server error
 */

hunterApp.get('/hunters/:id', async (req, res) => {
  try {
    const hunter = await Hunter.findById(req.params.id)
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
})

/**
 * @route DELETE /hunters
 * @summary Delete a hunter by name
 * @param {string} req.query.name - Name of the hunter to delete
 * @returns 200 - Hunter deleted
 * @returns 400 - Name query missing
 * @returns 404 - Hunter not found
 * @returns 500 - Server error
 */

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

/**
 * @route DELETE /hunters/{id}
 * @summary Delete a hunter by ID
 * @param {string} id.path.required - Hunter ID
 * @returns 200 - Hunter deleted
 * @returns 400 - ID param missing
 * @returns 404 - Hunter not found
 * @returns 500 - Server error
 */

hunterApp.delete('/hunters/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).send()
  }
  else {
    try {
      const hunter = await Hunter.findByIdAndDelete(req.params.id)
      if (!hunter) {
        res.status(404).send({
          error: `Hunter wiht ID ${req.params.id} not found`
        })
      }
      else {
        res.status(200).send(hunter)
      }
    }
    catch(err) {
      res.status(500).send(err)
    }
  }
})

/**
 * @route ALL /hunters/{*splat}
 * @summary Catch-all for unsupported hunter methods
 * @returns 501 - Not implemented
 */

hunterApp.all('/hunters/{*splat}', (_, res) => {
  res.status(501).send()
})
