import express from 'express';
import '../db/mongoose.js';
import { TraderModel } from '../models/traders.js';

/**
 * Express router for handling trader-related operations.
 */
export const tradersRouter = express.Router();


/**
 * @route POST /traders
 * @summary Create a new trader
 * @param req.body - Trader data (must match TraderModel schema)
 * @returns 201 - Trader created successfully
 * @returns 500 - Server error
 */
tradersRouter.post('/traders', async (req, res) => {
  const trader = new TraderModel(req.body)
  try {
    await trader.save()
    res.status(201).send(trader)
  } catch (err) {
    res.status(500).send(err);
  }
})

/**
 * @route GET /traders
 * @summary Get all traders or filter by name
 * @param req.query.name - Optional name filter
 * @returns 200 - List of traders
 * @returns 404 - No traders found
 * @returns 500 - Server error
 */
tradersRouter.get('/traders', async (req, res) => {
  const filter = req.query.name ? { name: req.query.name } : {};
  try {
    const traders = await TraderModel.find(filter);
    if (traders.length === 0) {
      res.status(404).send();
    } else {
      res.status(200).send(traders);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});


/**
 * @route GET /traders/:id
 * @summary Get a trader by ID
 * @param req.params.id - Trader ID
 * @returns 200 - Trader found
 * @returns 404 - Trader not found
 * @returns 500 - Server error
 */
tradersRouter.get('/traders/:id', async (req, res) => {
  try {
    const trader = await TraderModel.findById(req.params.id);
    if (!trader) {
      res.status(404).send();
    } else {
      res.status(200).send(trader);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});


/**
 * @route PATCH /traders
 * @summary Update trader by name
 * @param req.query.name - Trader name
 * @param req.body - Fields to update (name, type, location)
 * @returns 200 - Trader updated
 * @returns 400 - Bad request (missing name or body or invalid fields)
 * @returns 404 - Trader not found
 * @returns 500 - Server error
 */
tradersRouter.patch('/traders', async (req, res) => {
  if (!req.query.name) {
    res.status(400).send({
      error: 'A name must be provided in the query string',
    });
  }

  if (!req.body) {
    res.status(400).send({
      error: 'Fields to be modified have to be provided in the request body',
    });
  }

  const allowedUpdates = ['name', 'type', 'location'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    res.status(400).send({
      error: 'Update is not permitted or has invalid types',
    });
  }

  try {
    const trader = await TraderModel.findOneAndUpdate({ name: req.query.name }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!trader) {
      res.status(404).send();
    }

    res.status(200).send(trader);
  } catch (error) {
    res.status(500).send(error);
  }
});


/**
 * @route PATCH /traders/:id
 * @summary Update trader by ID
 * @param req.params.id - Trader ID
 * @param req.body - Fields to update (name, type, location)
 * @returns 200 - Trader updated
 * @returns 400 - Bad request (missing body or invalid fields)
 * @returns 404 - Trader not found
 * @returns 500 - Server error
 */
tradersRouter.patch('/traders/:id', async (req, res) => {
  if (!req.body) {
    res.status(400).send({
      error: 'Fields to be modified have to be provided in the request body',
    });
  }

  const allowedUpdates = ['name', 'type', 'location'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    res.status(400).send({
      error: 'Update is not permitted',
    });
  }

  try {
    const trader = await TraderModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!trader) {
      res.status(404).send();
    }

    res.status(200).send(trader);
  } catch (error) {
    res.status(500).send(error);
  }
});


/**
 * @route DELETE /traders
 * @summary Delete trader by name
 * @param req.query.name - Trader name
 * @returns 200 - Trader deleted
 * @returns 400 - Name not provided
 * @returns 404 - Trader not found
 * @returns 500 - Server error
 */
tradersRouter.delete('/traders', async (req, res) => {
  if (!req.query.name) {
    res.status(400).send({
      error: 'A name must be provided',
    });
  }

  try {
    const trader = await TraderModel.findOneAndDelete({ name: req.query.name });
    if (!trader) {
      res.status(404).send();
    } else {
      res.status(200).send(trader);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});


/**
 * @route DELETE /traders/:id
 * @summary Delete trader by ID
 * @param req.params.id - Trader ID
 * @returns 200 - Trader deleted
 * @returns 404 - Trader not found
 * @returns 500 - Server error
 */
tradersRouter.delete('/traders/:id', async (req, res) => {
  try {
    const trader = await TraderModel.findByIdAndDelete(req.params.id);
    if (!trader) {
      res.status(404).send();
    } else {
      res.status(200).send(trader);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @route ALL /traders/{*splat}
 * @summary Catch-all for undefined trader routes
 * @returns 501 - Not implemented
 */
tradersRouter.all('/traders/{*splat}', (_, res) => {
  res.status(501).send()
})