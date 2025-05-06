import express from 'express';
import '../db/mongoose.js';
import { TraderModel } from '../models/traders.js';


export const tradersRouter = express();

tradersRouter.post('/traders', async (req, res) => {
  const trader = new TraderModel(req.body)
  try {
    await trader.save()
    res.status(201).send(trader)
  } catch (err) {
    res.status(500).send(err);
  }
})

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


tradersRouter.all('/traders/{*splat}', (_, res) => {
  res.status(501).send()
})